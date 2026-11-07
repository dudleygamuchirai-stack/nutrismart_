import os
import uuid
import io
import re
import csv
import json
import html
import random
import threading
import urllib.request
import urllib.error
from datetime import date, timedelta

from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# ==========================================
# CORS: lets the React frontend (a different website) call this API.
# For the prototype every website is allowed. To restrict it later, set
# ALLOWED_ORIGINS in Render > Environment (comma separated addresses).
# ==========================================
_origins = os.environ.get('ALLOWED_ORIGINS', '*')
allowed_origins = '*' if _origins.strip() == '*' else [o.strip() for o in _origins.split(',') if o.strip()]
CORS(app, resources={r"/*": {"origins": allowed_origins}})

# ==========================================
# DATABASE CONNECTION (Supabase PostgreSQL)
# The connection string lives in Render > Environment > DATABASE_URL
# ==========================================
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    raise RuntimeError("DATABASE_URL is not set. Add it in Render > Environment.")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}
db = SQLAlchemy(app)

# ==========================================
# DATABASE MODELS
# Every name below matches the tables you created in Supabase (Task 5).
# We do NOT call db.create_all(): the tables already exist.
# ==========================================

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))          # added by FIX 1 in Supabase
    default_budget = db.Column(db.Numeric(8, 2), default=500)
    household_size = db.Column(db.Integer, default=1)
    dietary_prefs = db.Column(ARRAY(Text), default=list)
    email_notify = db.Column(db.Boolean, default=False)
    # profile from the induction page (added by supabase_update_1)
    age = db.Column(db.Integer)
    sex = db.Column(db.String(10))
    height_cm = db.Column(db.Numeric(5, 1))
    weight_kg = db.Column(db.Numeric(5, 1))
    activity_level = db.Column(db.String(20))
    goal = db.Column(db.String(20))
    daily_calorie_target = db.Column(db.Integer)


class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(30), nullable=False)
    price_zar = db.Column(db.Numeric(8, 2), nullable=False)
    retailer = db.Column(db.String(80))
    calories_per_unit = db.Column(db.Numeric(8, 2))
    protein_g = db.Column(db.Numeric(8, 2))
    carbs_g = db.Column(db.Numeric(8, 2))
    fat_g = db.Column(db.Numeric(8, 2))
    is_active = db.Column(db.Boolean, default=True)


class Meal(db.Model):
    __tablename__ = 'meals'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)   # breakfast / lunch / dinner
    dietary_tags = db.Column(ARRAY(Text), default=list)
    prep_minutes = db.Column(db.Integer, default=30)
    instructions = db.Column(db.Text)
    image_url = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)


class MealIngredient(db.Model):
    __tablename__ = 'meal_ingredients'
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'))
    quantity = db.Column(db.Numeric(10, 5), nullable=False)   # fraction of one pack, per person


class MealPlan(db.Model):
    __tablename__ = 'meal_plans'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    week_start = db.Column(db.Date, nullable=False)
    budget_zar = db.Column(db.Numeric(8, 2), nullable=False)
    household_size = db.Column(db.Integer, nullable=False)
    total_cost = db.Column(db.Numeric(8, 2))
    is_saved = db.Column(db.Boolean, default=False)
    plan_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, server_default=func.now())


class MealPlanDay(db.Model):
    __tablename__ = 'meal_plan_days'
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('meal_plans.id'))
    day_number = db.Column(db.Integer, nullable=False)     # 1 = Monday ... 7 = Sunday
    breakfast_id = db.Column(db.Integer, db.ForeignKey('meals.id'))
    lunch_id = db.Column(db.Integer, db.ForeignKey('meals.id'))
    dinner_id = db.Column(db.Integer, db.ForeignKey('meals.id'))
    day_cost = db.Column(db.Numeric(8, 2))


# ==========================================
# HELPERS
# ==========================================
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def parse_uuid(value):
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


def prefs_to_list(value):
    """Turn 'vegetarian' or 'halal, vegetarian' or ['halal'] into a clean list. 'None' -> []."""
    if value is None:
        return []
    if isinstance(value, str):
        value = value.split(',')
    cleaned = []
    for item in value:
        item = str(item).strip().lower()
        if item and item != 'none':
            cleaned.append(item)
    return cleaned


def get_meal_stats():
    """Per meal, for ONE person: {meal_id: {"cost": rands, "kcal": calories}}."""
    rows = (
        db.session.query(
            MealIngredient.meal_id,
            func.sum(MealIngredient.quantity * Ingredient.price_zar),
            func.sum(MealIngredient.quantity * func.coalesce(Ingredient.calories_per_unit, 0)),
        )
        .join(Ingredient, Ingredient.id == MealIngredient.ingredient_id)
        .group_by(MealIngredient.meal_id)
        .all()
    )
    return {mid: {"cost": float(c or 0), "kcal": float(k or 0)} for mid, c, k in rows}


# ==========================================
# CALORIE TARGET (Mifflin-St Jeor equation) - used by the induction page
# ==========================================
ACTIVITY_FACTORS = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725}
GOAL_ADJUST = {"lose": -400, "maintain": 0, "gain": 300}      # kcal per day


def calc_daily_calories(age, sex, height_cm, weight_kg, activity="light", goal="maintain"):
    """Daily calorie target for ONE person (whole kcal). Never below 1200 (female) / 1500 (male)."""
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    bmr = base + 5 if sex == "male" else base - 161
    target = bmr * ACTIVITY_FACTORS[activity] + GOAL_ADJUST[goal]
    return int(max(target, 1500 if sex == "male" else 1200) + 0.5)   # rounds half up (same as the frontend)


def validate_profile(data):
    """Check the induction answers. Returns (clean_values, errors). Errors are {field: message}."""
    errors, clean = {}, {}

    def number(key, label, low, high):
        try:
            value = float(data.get(key))
        except (TypeError, ValueError):
            errors[key] = f"{label} is required and must be a number"
            return
        if not low <= value <= high:
            errors[key] = f"{label} must be between {low} and {high}"
            return
        clean[key] = value

    number("Age", "Age", 15, 90)
    number("HeightCm", "Height (cm)", 120, 230)
    number("WeightKg", "Weight (kg)", 30, 250)

    sex = str(data.get("Sex", "")).strip().lower()
    if sex not in ("male", "female"):
        errors["Sex"] = "Choose male or female"
    clean["Sex"] = sex
    activity = str(data.get("ActivityLevel", "light")).strip().lower() or "light"
    if activity not in ACTIVITY_FACTORS:
        errors["ActivityLevel"] = "Choose sedentary, light, moderate or active"
    clean["ActivityLevel"] = activity
    goal = str(data.get("Goal", "maintain")).strip().lower() or "maintain"
    if goal not in GOAL_ADJUST:
        errors["Goal"] = "Choose lose, maintain or gain"
    clean["Goal"] = goal

    if not errors:
        clean["DailyCalories"] = calc_daily_calories(
            clean["Age"], sex, clean["HeightCm"], clean["WeightKg"], activity, goal)
    return clean, errors


# ==========================================
# WELCOME EMAIL (sent over HTTPS with the Brevo API: Render's free plan blocks SMTP ports)
# Render > Environment: BREVO_API_KEY, MAIL_FROM_EMAIL (a sender verified in Brevo), MAIL_FROM_NAME (optional)
# If BREVO_API_KEY is missing the email is skipped and registration still works.
# ==========================================
def build_welcome_html(full_name, email, household, profile):
    e = html.escape
    rows = [("Name", full_name), ("Email", email), ("Household size", household)]
    if profile.get("HeightCm"):
        rows += [("Height", f"{profile['HeightCm']:g} cm"), ("Weight", f"{profile['WeightKg']:g} kg")]
    if profile.get("DailyCalories"):
        rows.append(("Daily calorie target", f"{profile['DailyCalories']} kcal per person"))
    items = "".join(f"<tr><td style='padding:4px 12px 4px 0'><b>{e(str(k))}</b></td><td>{e(str(v))}</td></tr>" for k, v in rows)
    return (
        "<div style='font-family:Arial,sans-serif;max-width:520px'>"
        f"<h2 style='color:#0D2F5E'>Welcome to NutriSmart SA, {e(full_name.split(' ')[0])}!</h2>"
        "<p>Your account has been created and your details are saved. Here is what we stored:</p>"
        f"<table>{items}</table>"
        "<p>Your password is never stored in readable form and is never emailed.</p>"
        "<p>Prices in NutriSmart SA are estimates based on typical South African supermarket prices, "
        "not live store prices. Log in any time to build your 7-day meal plan.</p>"
        "<p style='color:#687280'>If you did not create this account, you can ignore this email.</p></div>"
    )


def send_welcome_email(to_email, full_name, household, profile):
    """Returns True if the email provider accepted the message. Never raises."""
    api_key = os.environ.get("BREVO_API_KEY")
    sender = os.environ.get("MAIL_FROM_EMAIL")
    if not api_key or not sender:
        print("Welcome email skipped: BREVO_API_KEY or MAIL_FROM_EMAIL is not set")
        return False
    payload = {
        "sender": {"name": os.environ.get("MAIL_FROM_NAME", "NutriSmart SA"), "email": sender},
        "to": [{"email": to_email, "name": full_name}],
        "subject": "Welcome to NutriSmart SA - your account is ready",
        "htmlContent": build_welcome_html(full_name, to_email, household, profile),
    }
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={"api-key": api_key, "Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return 200 <= resp.status < 300
    except urllib.error.HTTPError as err:
        print("Welcome email failed:", err.code, err.read()[:200])
    except Exception as err:       # network problems must never break registration
        print("Welcome email failed:", err.__class__.__name__)
    return False


def send_welcome_email_async(*args):
    threading.Thread(target=send_welcome_email, args=args, daemon=True).start()


# ==========================================
# ROUTES
# ==========================================
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "Connected to NutriSmart SA PostgreSQL Database!"
    })


# ---------- AUTHENTICATION ----------
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def user_payload(user):
    """What the frontend receives about a user (never the password)."""
    prefs = user.dietary_prefs or []
    return {
        "UserID": str(user.id),
        "FullName": user.full_name,
        "Email": user.email,
        "WeeklyBudget": float(user.default_budget) if user.default_budget else 0.00,
        "HouseholdSize": user.household_size or 1,
        "DietaryPreference": ", ".join(prefs) if prefs else "None",
        "Age": user.age,
        "Sex": user.sex,
        "HeightCm": float(user.height_cm) if user.height_cm is not None else None,
        "WeightKg": float(user.weight_kg) if user.weight_kg is not None else None,
        "ActivityLevel": user.activity_level,
        "Goal": user.goal,
        "DailyCalorieTarget": user.daily_calorie_target,
    }


def field_errors(errors, status=400, message="Please fix the highlighted fields"):
    return jsonify({"status": "error", "message": message, "errors": errors}), status


@app.route('/calories/calculate', methods=['POST'])
def calories_calculate():
    """Used by the induction page (before login) to show the daily calorie target."""
    clean, errors = validate_profile(request.get_json(silent=True) or {})
    if errors:
        return field_errors(errors, message="Please check your answers")
    return jsonify({"status": "success", "daily_calories": clean["DailyCalories"]}), 200


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    errors = {}

    full_name = str(data.get('FullName', '')).strip()
    email = str(data.get('Email', '')).strip().lower()
    password = str(data.get('Password', ''))

    if not full_name:
        errors['FullName'] = "Full name is required"
    if not email:
        errors['Email'] = "Email is required"
    elif not EMAIL_PATTERN.match(email):
        errors['Email'] = "Enter a valid email address"
    if len(password) < 8:
        errors['Password'] = "Password must be at least 8 characters"

    try:
        household = int(data.get('HouseholdSize', 1))
        if not 1 <= household <= 20:
            raise ValueError
    except (TypeError, ValueError):
        errors['HouseholdSize'] = "Household size must be a whole number from 1 to 20"
        household = 1

    # Induction answers are optional, but if they are sent they must be complete and valid
    profile = {}
    if any(data.get(k) not in (None, "") for k in ("Age", "HeightCm", "WeightKg")):
        profile, profile_errors = validate_profile(data)
        errors.update(profile_errors)

    if errors:
        return field_errors(errors)

    if User.query.filter(func.lower(User.email) == email).first():
        return field_errors({'Email': "This email is already registered. Please log in."}, status=409,
                            message="Email already registered")

    try:
        new_user = User(
            full_name=full_name,
            email=email,
            password_hash=generate_password_hash(password, method='scrypt'),
            default_budget=data.get('WeeklyBudget', 500),
            household_size=household,
            dietary_prefs=prefs_to_list(data.get('DietaryPreference')),
        )
        if profile:
            new_user.age = int(profile['Age'])
            new_user.sex = profile['Sex']
            new_user.height_cm = profile['HeightCm']
            new_user.weight_kg = profile['WeightKg']
            new_user.activity_level = profile['ActivityLevel']
            new_user.goal = profile['Goal']
            new_user.daily_calorie_target = profile['DailyCalories']
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Could not register user: {e.__class__.__name__}"}), 500

    email_configured = bool(os.environ.get('BREVO_API_KEY') and os.environ.get('MAIL_FROM_EMAIL'))
    if email_configured:
        send_welcome_email_async(email, full_name, household, profile)

    return jsonify({
        "status": "success",
        "message": "User registered successfully",
        "UserID": str(new_user.id),
        "user": user_payload(new_user),
        "welcome_email": "sending" if email_configured else "not_configured",
    }), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get('Email', '')).strip().lower()
    password = str(data.get('Password', ''))

    errors = {}
    if not email:
        errors['Email'] = "Email is required"
    if not password:
        errors['Password'] = "Password is required"
    if errors:
        return field_errors(errors)

    user = User.query.filter(func.lower(User.email) == email).first()
    if not user:
        return jsonify({"status": "error", "field": "email",
                        "message": "No account found with that email address."}), 401
    if not user.password_hash or not check_password_hash(user.password_hash, password):
        return jsonify({"status": "error", "field": "password",
                        "message": "Incorrect password. Please try again."}), 401

    return jsonify({"status": "success", "message": "Login successful", "user": user_payload(user)}), 200


# ---------- PRODUCTS (these are your 'ingredients' table) ----------
@app.route('/products', methods=['GET'])
def get_products():
    items = Ingredient.query.filter_by(is_active=True).order_by(Ingredient.id).all()
    product_list = []
    for i in items:
        product_list.append({
            "ProductID": i.id,
            "ItemName": i.name,
            "Brand": i.retailer,
            "Weight_Volume": i.unit,
            "Category": i.category,
            "Price": float(i.price_zar) if i.price_zar is not None else 0.0,
            "Calories": float(i.calories_per_unit) if i.calories_per_unit is not None else None,
            "Protein_g": float(i.protein_g) if i.protein_g is not None else None,
            "Carbs_g": float(i.carbs_g) if i.carbs_g is not None else None,
            "Fat_g": float(i.fat_g) if i.fat_g is not None else None,
        })
    return jsonify({"status": "success", "products": product_list}), 200


@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json(silent=True) or {}
    required = ['ItemName', 'Category', 'Weight_Volume', 'Price']
    if any(not data.get(k) for k in required):
        return jsonify({"status": "error",
                        "message": "ItemName, Category, Weight_Volume and Price are required"}), 400
    try:
        db.session.add(Ingredient(
            name=data['ItemName'],
            category=data['Category'],
            unit=data['Weight_Volume'],
            price_zar=data['Price'],
            retailer=data.get('Brand', ''),
        ))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Could not add product: {e.__class__.__name__}"}), 500
    return jsonify({"status": "success", "message": "Product added successfully"}), 201


# ---------- 7-DAY MEAL PLAN GENERATION ----------
def pick_week(pool):
    """7 meals for one meal type, shuffled, with no repeats until every meal has been used."""
    picks = []
    while len(picks) < 7:
        batch = random.sample(pool, len(pool))
        if picks and len(batch) > 1 and batch[0] is picks[-1]:
            batch[0], batch[1] = batch[1], batch[0]   # avoid the same meal two days running
        picks.extend(batch)
    return picks[:7]


@app.route('/plans/generate', methods=['POST'])
def generate_7day_plan():
    data = request.get_json(silent=True) or {}

    user_id = parse_uuid(data.get('UserID'))
    if not user_id:
        return jsonify({"status": "error", "message": "A valid UserID (UUID) is required"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    try:
        weekly_budget = float(data.get('WeeklyBudget', user.default_budget or 0))
        household = int(data.get('HouseholdSize', user.household_size or 1))
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "WeeklyBudget and HouseholdSize must be numbers"}), 400

    if weekly_budget <= 0:
        return jsonify({"status": "error", "message": "Valid WeeklyBudget is required"}), 400
    household = max(household, 1)

    if 'DietaryPreference' in data:
        prefs = prefs_to_list(data.get('DietaryPreference'))
    else:
        prefs = prefs_to_list(user.dietary_prefs)

    query = Meal.query.filter_by(is_active=True)
    if prefs:
        query = query.filter(Meal.dietary_tags.contains(prefs))   # meal must carry ALL chosen tags
    stats = get_meal_stats()
    all_meals = [m for m in query.all() if stats.get(m.id, {}).get("cost", 0) > 0]   # ignore meals with no recipe

    pools = {t: [m for m in all_meals if m.meal_type.lower() == t] for t in ("breakfast", "lunch", "dinner")}
    if not all(pools.values()):
        return jsonify({
            "status": "error",
            "message": "Not enough meals (with ingredients) for the selected dietary preferences."
        }), 422

    # Try 300 random weeks. Prefer a week inside the budget whose average calories per person
    # is closest to the user's daily calorie target; if none fits the budget, take the cheapest.
    target = user.daily_calorie_target
    best, best_score = None, None
    for _ in range(300):
        picks, total, kcal_sum = [], 0.0, 0.0
        # Variety: no meal repeats until the pool is used up (7 different meals when 7+ exist)
        week = {t: pick_week(pools[t]) for t in ("breakfast", "lunch", "dinner")}
        for _day in range(7):
            b, l, d = (week[t][_day] for t in ("breakfast", "lunch", "dinner"))
            day_cost = sum(stats[m.id]["cost"] for m in (b, l, d)) * household
            kcal_sum += sum(stats[m.id]["kcal"] for m in (b, l, d))
            total += day_cost
            picks.append((b, l, d, day_cost))
        over = max(0.0, total - weekly_budget)
        gap = abs(kcal_sum / 7 - target) if target else 0.0
        score = (over > 0, over if over > 0 else gap)
        if best_score is None or score < best_score:
            best, best_score, best_total = picks, score, total

    # Week start = the Monday of this week (or the date the caller sends)
    try:
        week_start = date.fromisoformat(data['WeekStart']) if data.get('WeekStart') else None
    except ValueError:
        return jsonify({"status": "error", "message": "WeekStart must look like 2026-11-09"}), 400
    if week_start is None:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

    try:
        plan = MealPlan(
            user_id=user_id,
            week_start=week_start,
            budget_zar=weekly_budget,
            household_size=household,
            total_cost=round(best_total, 2),
            plan_name=data.get('PlanName'),
        )
        db.session.add(plan)
        db.session.flush()   # gives the plan its id

        for index, (b, l, d, day_cost) in enumerate(best):
            db.session.add(MealPlanDay(
                plan_id=plan.id, day_number=index + 1,
                breakfast_id=b.id, lunch_id=l.id, dinner_id=d.id,
                day_cost=round(day_cost, 2),
            ))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Could not save plan: {e.__class__.__name__}"}), 500

    payload = build_plan_payload(plan)
    payload["status"] = "success"
    payload["within_budget"] = best_total <= weekly_budget
    return jsonify(payload), 201


# ---------- FETCH SAVED PLANS BY USER ----------
@app.route('/plans/user/<user_id>', methods=['GET'])
def get_user_plans(user_id):
    uid = parse_uuid(user_id)
    if not uid:
        return jsonify({"status": "error", "message": "UserID must be a valid UUID"}), 400

    user_plans = MealPlan.query.filter_by(user_id=uid).order_by(MealPlan.created_at.desc()).all()

    plans_data = [{
        "plan_id": str(p.id),
        "user_id": str(p.user_id),
        "plan_name": p.plan_name,
        "week_start": p.week_start.isoformat() if p.week_start else None,
        "weekly_budget_zar": float(p.budget_zar),
        "total_cost_zar": float(p.total_cost) if p.total_cost is not None else 0.0,
        "is_saved": bool(p.is_saved),
    } for p in user_plans]

    return jsonify({
        "status": "success",
        "total_plans": len(plans_data),
        "plans": plans_data
    }), 200


# ---------- ONE DETAILED PLAN (shared by the dashboard, generate and download) ----------
PRICE_NOTE = "Prices are estimates based on typical South African supermarket prices, not live store prices."


def build_plan_payload(plan):
    """Everything about one saved plan: 7-day schedule, costs and calories (per person)."""
    days = MealPlanDay.query.filter_by(plan_id=plan.id).order_by(MealPlanDay.day_number).all()
    meal_ids = {x for d in days for x in (d.breakfast_id, d.lunch_id, d.dinner_id) if x}
    names = {m.id: m.name for m in Meal.query.filter(Meal.id.in_(meal_ids)).all()} if meal_ids else {}
    stats = get_meal_stats()
    kcal = lambda mid: round(stats.get(mid, {}).get("kcal", 0))

    schedule, day_totals = [], []
    for d in days:
        day_kcal = kcal(d.breakfast_id) + kcal(d.lunch_id) + kcal(d.dinner_id)
        day_totals.append(day_kcal)
        schedule.append({
            "day": DAY_NAMES[d.day_number - 1] if 1 <= d.day_number <= 7 else str(d.day_number),
            "breakfast": names.get(d.breakfast_id),
            "lunch": names.get(d.lunch_id),
            "dinner": names.get(d.dinner_id),
            "breakfast_calories": kcal(d.breakfast_id),
            "lunch_calories": kcal(d.lunch_id),
            "dinner_calories": kcal(d.dinner_id),
            "day_calories_per_person": day_kcal,
            "day_cost_zar": float(d.day_cost) if d.day_cost is not None else 0.0,
        })

    household = plan.household_size or 1
    avg = round(sum(day_totals) / len(day_totals)) if day_totals else 0
    owner = db.session.get(User, plan.user_id) if plan.user_id else None
    budget = float(plan.budget_zar)
    total = float(plan.total_cost) if plan.total_cost is not None else 0.0
    return {
        "plan_id": str(plan.id),
        "user_id": str(plan.user_id) if plan.user_id else None,
        "plan_name": plan.plan_name,
        "week_start": plan.week_start.isoformat() if plan.week_start else None,
        "weekly_budget_zar": budget,
        "total_cost_zar": total,
        "remaining_zar": round(budget - total, 2),
        "household_size": household,
        "avg_calories_per_person_per_day": avg,
        "avg_calories_household_per_day": avg * household,
        "calorie_target_per_person": owner.daily_calorie_target if owner else None,
        "price_note": PRICE_NOTE,
        "schedule": schedule,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
    }


@app.route('/plans/<plan_id>', methods=['GET'])
def get_plan_by_id(plan_id):
    pid = parse_uuid(plan_id)
    if not pid:
        return jsonify({"status": "error", "message": "PlanID must be a valid UUID"}), 400
    plan = db.session.get(MealPlan, pid)
    if not plan:
        return jsonify({"status": "error", "message": f"Meal plan {plan_id} not found"}), 404
    payload = build_plan_payload(plan)
    payload["status"] = "success"
    return jsonify(payload), 200


# ---------- DOWNLOAD A PLAN (PDF or CSV) ----------
def build_plan_csv(plan):
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["NutriSmart SA meal plan"])
    w.writerow(["Week starting", plan["week_start"]])
    w.writerow(["Household size", plan["household_size"]])
    w.writerow(["Weekly budget (R)", plan["weekly_budget_zar"]])
    w.writerow(["Estimated cost (R)", plan["total_cost_zar"]])
    w.writerow(["Average calories per day (per person)", plan["avg_calories_per_person_per_day"]])
    w.writerow([PRICE_NOTE])
    w.writerow([])
    w.writerow(["Day", "Breakfast", "Lunch", "Dinner", "Calories per person", "Day cost (R)"])
    for d in plan["schedule"]:
        w.writerow([d["day"], d["breakfast"], d["lunch"], d["dinner"],
                    d["day_calories_per_person"], f"{d['day_cost_zar']:.2f}"])
    return out.getvalue().encode("utf-8-sig")      # utf-8-sig so Excel opens it correctly


def build_plan_pdf(plan):
    """Returns PDF bytes, or None if the reportlab package is not installed."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError:
        return None

    e = html.escape
    styles = getSampleStyleSheet()
    cell = ParagraphStyle("cell", parent=styles["BodyText"], fontSize=9, leading=11)
    head = ParagraphStyle("head", parent=cell, textColor=colors.white, fontName="Helvetica-Bold")
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4), leftMargin=14 * mm, rightMargin=14 * mm,
                            topMargin=12 * mm, bottomMargin=12 * mm, title="NutriSmart SA meal plan")
    people = plan["household_size"]
    story = [
        Paragraph("NutriSmart SA - 7-day meal plan", styles["Title"]),
        Paragraph(e(f"Week starting {plan['week_start']} | {people} {'person' if people == 1 else 'people'}"), styles["BodyText"]),
        Paragraph(e(f"Weekly budget: R{plan['weekly_budget_zar']:.2f} | Estimated cost: R{plan['total_cost_zar']:.2f} | "
                    f"Remaining: R{plan['remaining_zar']:.2f}"), styles["BodyText"]),
        Paragraph(e(f"Average calories per day: {plan['avg_calories_per_person_per_day']} per person"
                    + (f" ({plan['avg_calories_household_per_day']} for the household)" if people > 1 else "")),
                  styles["BodyText"]),
        Spacer(1, 6),
    ]
    rows = [[Paragraph(h, head) for h in ("Day", "Breakfast", "Lunch", "Dinner", "Calories / person", "Day cost")]]
    for d in plan["schedule"]:
        rows.append([Paragraph(e(str(v)), cell) for v in (
            d["day"], d["breakfast"] or "-", d["lunch"] or "-", d["dinner"] or "-",
            d["day_calories_per_person"], f"R{d['day_cost_zar']:.2f}")])
    table = Table(rows, colWidths=[24 * mm, 62 * mm, 62 * mm, 62 * mm, 30 * mm, 24 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D2F5E")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F6F4")]),
    ]))
    story += [table, Spacer(1, 8), Paragraph(e(plan["price_note"]), styles["Italic"])]
    doc.build(story)
    return buf.getvalue()


@app.route('/plans/<plan_id>/download', methods=['GET'])
def download_plan(plan_id):
    pid = parse_uuid(plan_id)
    if not pid:
        return jsonify({"status": "error", "message": "PlanID must be a valid UUID"}), 400
    plan = db.session.get(MealPlan, pid)
    if not plan:
        return jsonify({"status": "error", "message": f"Meal plan {plan_id} not found"}), 404

    payload = build_plan_payload(plan)
    base = f"NutriSmart_plan_{payload['week_start'] or 'week'}"
    wanted = request.args.get('format', 'pdf').lower()

    pdf = build_plan_pdf(payload) if wanted == 'pdf' else None
    if pdf:
        return Response(pdf, mimetype="application/pdf",
                        headers={"Content-Disposition": f'attachment; filename="{base}.pdf"'})
    # CSV: asked for directly, or the PDF library is not installed
    return Response(build_plan_csv(payload), mimetype="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="{base}.csv"'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
