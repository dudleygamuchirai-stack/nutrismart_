import os
import uuid
import random
from datetime import date, timedelta

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

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
    quantity = db.Column(db.Numeric(8, 2), nullable=False)


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


def get_meal_costs():
    """Cost of each meal = sum of (quantity x ingredient price). Returns {meal_id: cost}."""
    rows = (
        db.session.query(
            MealIngredient.meal_id,
            func.sum(MealIngredient.quantity * Ingredient.price_zar)
        )
        .join(Ingredient, Ingredient.id == MealIngredient.ingredient_id)
        .group_by(MealIngredient.meal_id)
        .all()
    )
    return {meal_id: float(total or 0) for meal_id, total in rows}


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
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    if not data.get('Email') or not data.get('Password') or not data.get('FullName'):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    if User.query.filter_by(email=data['Email']).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 400

    try:
        new_user = User(
            full_name=data['FullName'],
            email=data['Email'],
            password_hash=generate_password_hash(data['Password'], method='scrypt'),
            default_budget=data.get('WeeklyBudget', 500),
            household_size=int(data.get('HouseholdSize', 1)),
            dietary_prefs=prefs_to_list(data.get('DietaryPreference')),
        )
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Could not register user: {e.__class__.__name__}"}), 500

    return jsonify({
        "status": "success",
        "message": "User registered successfully",
        "UserID": str(new_user.id)
    }), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    if not data.get('Email') or not data.get('Password'):
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    user = User.query.filter_by(email=data['Email']).first()

    if not user or not user.password_hash or not check_password_hash(user.password_hash, data['Password']):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    prefs = user.dietary_prefs or []
    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "UserID": str(user.id),
            "FullName": user.full_name,
            "Email": user.email,
            "WeeklyBudget": float(user.default_budget) if user.default_budget else 0.00,
            "HouseholdSize": user.household_size or 1,
            "DietaryPreference": ", ".join(prefs) if prefs else "None"
        }
    }), 200


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
    all_meals = query.all()

    costs = get_meal_costs()
    all_meals = [m for m in all_meals if costs.get(m.id, 0) > 0]   # ignore meals with no ingredients

    breakfast_pool = [m for m in all_meals if m.meal_type.lower() == 'breakfast']
    lunch_pool = [m for m in all_meals if m.meal_type.lower() == 'lunch']
    dinner_pool = [m for m in all_meals if m.meal_type.lower() == 'dinner']

    if not breakfast_pool or not lunch_pool or not dinner_pool:
        return jsonify({
            "status": "error",
            "message": "Not enough meals (with ingredients) for the selected dietary preferences."
        }), 422

    # Try up to 100 random weeks; keep the first one inside the budget, else the cheapest.
    best_days, best_total = None, None
    for _ in range(100):
        picks, total = [], 0.0
        for _day in range(7):
            b, l, d = random.choice(breakfast_pool), random.choice(lunch_pool), random.choice(dinner_pool)
            day_cost = (costs[b.id] + costs[l.id] + costs[d.id]) * household
            total += day_cost
            picks.append((b, l, d, day_cost))
        if best_total is None or total < best_total:
            best_days, best_total = picks, total
        if total <= weekly_budget:
            best_days, best_total = picks, total
            break

    # Week start = the Monday of this week (or the date the caller sends)
    try:
        week_start = date.fromisoformat(data['WeekStart']) if data.get('WeekStart') else None
    except ValueError:
        return jsonify({"status": "error", "message": "WeekStart must look like 2026-10-12"}), 400
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

        schedule = []
        for index, (b, l, d, day_cost) in enumerate(best_days):
            db.session.add(MealPlanDay(
                plan_id=plan.id,
                day_number=index + 1,
                breakfast_id=b.id,
                lunch_id=l.id,
                dinner_id=d.id,
                day_cost=round(day_cost, 2),
            ))
            schedule.append({
                "day": DAY_NAMES[index],
                "breakfast": b.name,
                "lunch": l.name,
                "dinner": d.name,
                "day_cost_zar": round(day_cost, 2),
            })
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Could not save plan: {e.__class__.__name__}"}), 500

    return jsonify({
        "status": "success",
        "plan_id": str(plan.id),
        "user_id": str(user_id),
        "weekly_budget_zar": weekly_budget,
        "household_size": household,
        "total_cost_zar": round(best_total, 2),
        "within_budget": best_total <= weekly_budget,
        "schedule": schedule
    }), 201


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


# ---------- FETCH ONE DETAILED PLAN ----------
@app.route('/plans/<plan_id>', methods=['GET'])
def get_plan_by_id(plan_id):
    pid = parse_uuid(plan_id)
    if not pid:
        return jsonify({"status": "error", "message": "PlanID must be a valid UUID"}), 400

    plan = db.session.get(MealPlan, pid)
    if not plan:
        return jsonify({"status": "error", "message": f"Meal plan {plan_id} not found"}), 404

    days = MealPlanDay.query.filter_by(plan_id=pid).order_by(MealPlanDay.day_number).all()
    meal_ids = {x for d in days for x in (d.breakfast_id, d.lunch_id, d.dinner_id) if x}
    names = {m.id: m.name for m in Meal.query.filter(Meal.id.in_(meal_ids)).all()} if meal_ids else {}

    schedule = [{
        "day": DAY_NAMES[d.day_number - 1] if 1 <= d.day_number <= 7 else str(d.day_number),
        "breakfast": names.get(d.breakfast_id),
        "lunch": names.get(d.lunch_id),
        "dinner": names.get(d.dinner_id),
        "day_cost_zar": float(d.day_cost) if d.day_cost is not None else 0.0,
    } for d in days]

    return jsonify({
        "status": "success",
        "plan_id": str(plan.id),
        "user_id": str(plan.user_id),
        "plan_name": plan.plan_name,
        "week_start": plan.week_start.isoformat() if plan.week_start else None,
        "weekly_budget_zar": float(plan.budget_zar),
        "household_size": plan.household_size,
        "total_cost_zar": float(plan.total_cost) if plan.total_cost is not None else 0.0,
        "schedule": schedule,
        "created_at": plan.created_at.isoformat() if plan.created_at else None
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
