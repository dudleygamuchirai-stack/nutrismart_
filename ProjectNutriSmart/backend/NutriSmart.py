import random
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# ==========================================
# DATABASE CONNECTION (PostgreSQL / Supabase)
# ==========================================
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://postgres:NCK402PJB321@db.prwjyfepxirwgeqlhbsx.supabase.co:5432/postgres'
)
db = SQLAlchemy(app)

# ==========================================
# DATABASE MODELS
# ==========================================

class User(db.Model):
    _tablename_ = 'User'
    UserID = db.Column(db.Integer, primary_key=True)
    FullName = db.Column(db.String(100), nullable=False)
    Email = db.Column(db.String(255), unique=True, nullable=False)
    PasswordHash = db.Column(db.String(255), nullable=False)
    WeeklyBudget = db.Column(db.Numeric(9, 2), default=500.00)
    DietaryPreference = db.Column(db.String(100), default='None')

class Product(db.Model):
    _tablename_ = 'Product'
    ProductID = db.Column(db.Integer, primary_key=True)
    ItemName = db.Column(db.String(255), nullable=False)
    Brand = db.Column(db.String(255))
    Weight_Volume = db.Column(db.String(100))
    Category = db.Column(db.String(100))
    NutritionalValuePer100g = db.Column(db.String(255))
    Price = db.Column(db.Numeric(10, 2), default=0.00)

class Meal(db.Model):
    _tablename_ = 'Meal'
    MealID = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(150), nullable=False)
    MealType = db.Column(db.String(20), nullable=False)  # 'breakfast', 'lunch', 'dinner'
    DietaryTag = db.Column(db.String(50), default='None')
    EstimatedCost = db.Column(db.Numeric(8, 2), nullable=False)

class MealPlan(db.Model):
    _tablename_ = 'MealPlan'
    PlanID = db.Column(db.Integer, primary_key=True)
    UserID = db.Column(db.Integer, db.ForeignKey('User.UserID'), nullable=False)
    WeeklyBudget = db.Column(db.Numeric(8, 2), nullable=False)
    TotalCost = db.Column(db.Numeric(8, 2), nullable=False)

# ==========================================
# ROUTES
# ==========================================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "Connected to NutriSmart SA PostgreSQL Database!"
    })

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('Email') or not data.get('Password') or not data.get('FullName'):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
        
    if User.query.filter_by(Email=data['Email']).first():
        return jsonify({"status": "error", "message": "Email already registered"}), 400
        
    hashed_password = generate_password_hash(data['Password'], method='scrypt')
    new_user = User(
        FullName=data['FullName'],
        Email=data['Email'],
        PasswordHash=hashed_password,
        WeeklyBudget=data.get('WeeklyBudget', 0.00),
        DietaryPreference=data.get('DietaryPreference', 'None')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"status": "success", "message": "User registered successfully"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('Email') or not data.get('Password'):
        return jsonify({"status": "error", "message": "Email and password required"}), 400
        
    user = User.query.filter_by(Email=data['Email']).first()
    
    if not user or not check_password_hash(user.PasswordHash, data['Password']):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401
        
    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "UserID": user.UserID,
            "FullName": user.FullName,
            "Email": user.Email,
            "WeeklyBudget": float(user.WeeklyBudget) if user.WeeklyBudget else 0.00,
            "DietaryPreference": user.DietaryPreference
        }
    }), 200

# ==========================================
# PRODUCT ENDPOINTS
# ==========================================

@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    product_list = []
    for p in products:
        product_list.append({
            "ProductID": p.ProductID,
            "ItemName": p.ItemName,
            "Brand": p.Brand,
            "Weight_Volume": p.Weight_Volume,
            "Category": p.Category,
            "NutritionalValuePer100g": p.NutritionalValuePer100g
        })
    return jsonify({"status": "success", "products": product_list}), 200

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    if not data or not data.get('ItemName'):
        return jsonify({"status": "error", "message": "ItemName is required"}), 400
        
    new_product = Product(
        ItemName=data['ItemName'],
        Brand=data.get('Brand', ''),
        Weight_Volume=data.get('Weight_Volume', ''),
        Category=data.get('Category', ''),
        NutritionalValuePer100g=data.get('NutritionalValuePer100g', '')
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({"status": "success", "message": "Product added successfully"}), 201

# ==========================================
# 7-DAY MEAL PLAN GENERATION ENDPOINT
# ==========================================

@app.route('/plans/generate', methods=['POST'])
def generate_7day_plan():
    data = request.get_json()
    
    weekly_budget = float(data.get('WeeklyBudget', 0))
    user_id = data.get('UserID')
    dietary_pref = data.get('DietaryPreference', 'None')
    
    if weekly_budget <= 0:
        return jsonify({"status": "error", "message": "Valid WeeklyBudget is required"}), 400

    query = Meal.query
    if dietary_pref and dietary_pref.lower() != 'none':
        query = query.filter(
            (Meal.DietaryTag.ilike(f"%{dietary_pref}%")) | 
            (Meal.DietaryTag.ilike("%none%"))
        )
    
    all_meals = query.all()
    
    breakfast_pool = [m for m in all_meals if m.MealType.lower() == 'breakfast']
    lunch_pool = [m for m in all_meals if m.MealType.lower() == 'lunch']
    dinner_pool = [m for m in all_meals if m.MealType.lower() == 'dinner']

    if not breakfast_pool or not lunch_pool or not dinner_pool:
        return jsonify({
            "status": "error", 
            "message": "Not enough meals available for the selected dietary preferences."
        }), 422

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    weekly_schedule = []
    total_plan_cost = 0.0

    for day in days:
        b_meal = random.choice(breakfast_pool)
        l_meal = random.choice(lunch_pool)
        d_meal = random.choice(dinner_pool)
        
        day_cost = float(b_meal.EstimatedCost) + float(l_meal.EstimatedCost) + float(d_meal.EstimatedCost)
        total_plan_cost += day_cost

        weekly_schedule.append({
            "day": day,
            "breakfast": b_meal.Name,
            "lunch": l_meal.Name,
            "dinner": d_meal.Name,
            "day_cost_zar": round(day_cost, 2)
        })

    new_plan = MealPlan(
        UserID=user_id,
        WeeklyBudget=weekly_budget,
        TotalCost=round(total_plan_cost, 2)
    )
    db.session.add(new_plan)
    db.session.commit()

    return jsonify({
        "status": "success",
        "plan_id": new_plan.PlanID,
        "user_id": user_id,
        "weekly_budget_zar": weekly_budget,
        "total_cost_zar": round(total_plan_cost, 2),
        "within_budget": total_plan_cost <= weekly_budget,
        "schedule": weekly_schedule
    }), 201

# ==========================================
# FETCH SAVED MEAL PLANS BY USER ID
# ==========================================

@app.route('/plans/user/<int:user_id>', methods=['GET'])
def get_user_plans(user_id):
    user_plans = MealPlan.query.filter_by(UserID=user_id).all()
    
    if not user_plans:
        return jsonify({
            "status": "success",
            "message": f"No meal plans found for UserID {user_id}",
            "plans": []
        }), 200

    plans_data = []
    for plan in user_plans:
        plans_data.append({
            "plan_id": plan.PlanID,
            "user_id": plan.UserID,
            "weekly_budget_zar": float(plan.WeeklyBudget),
            "total_cost_zar": float(plan.TotalCost)
        })

    return jsonify({
        "status": "success",
        "total_plans": len(plans_data),
        "plans": plans_data
    }), 200

# ==========================================
# FETCH DETAILED MEAL PLAN BY PLAN ID (EXPANDED)
# ==========================================

@app.route('/plans/<int:plan_id>', methods=['GET'])
def get_plan_by_id(plan_id):
    plan = db.session.get(MealPlan,plan_id)
    
    if not plan:
        return jsonify({
            "status": "error",
            "message": f"Meal plan with PlanID {plan_id} not found"
        }), 404

    schedule_details = getattr(plan, 'ScheduleData', None)

    return jsonify({
        "status": "success",
        "plan_id": plan.PlanID,
        "user_id": plan.UserID,
        "weekly_budget_zar": float(plan.WeeklyBudget),
        "total_cost_zar": float(plan.TotalCost),
        "schedule": schedule_details if schedule_details else "Schedule metadata saved successfully",
        "created_at": plan.CreatedAt.isoformat() if hasattr(plan, 'CreatedAt') and plan.CreatedAt else None
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Meal.query.count() == 0:
            sample_meals = [
                Meal(Name='Jungle Oats with Milk & Seeds', MealType='breakfast', DietaryTag='vegetarian', EstimatedCost=18.50),
                Meal(Name='Toast with Scrambled Eggs Substitute', MealType='breakfast', DietaryTag='halal', EstimatedCost=15.00),
                Meal(Name='Smoothie Bowl', MealType='breakfast', DietaryTag='vegetarian', EstimatedCost=22.00),
                Meal(Name='Red Beans & Rice Bowl', MealType='lunch', DietaryTag='halal', EstimatedCost=25.00),
                Meal(Name='Spinach & Cheese Wrap', MealType='lunch', DietaryTag='vegetarian', EstimatedCost=30.00),
                Meal(Name='Chicken & Veggie Stir-Fry', MealType='lunch', DietaryTag='None', EstimatedCost=35.00),
                Meal(Name='Pap and Chakalaka with Beans', MealType='dinner', DietaryTag='vegetarian', EstimatedCost=28.00),
                Meal(Name='Grilled Chicken with Rice & Spinach', MealType='dinner', DietaryTag='halal', EstimatedCost=45.00),
                Meal(Name='Lentil Stew with Brown Rice', MealType='dinner', DietaryTag='vegetarian', EstimatedCost=22.50)
            ]
            db.session.bulk_save_objects(sample_meals)
            db.session.commit()
            print("Successfully seeded initial meals into PostgreSQL!")
            
    app.run(debug=True, port=5000)