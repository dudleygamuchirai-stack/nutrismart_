# NutriSmart SA — API Documentation

*Tech Stack:* Python (Flask), SQLAlchemy, PostgreSQL (Supabase)  
*Base URL:* http://127.0.0.1:5000

---

## Authentication Endpoints

### 1. Register User
Registers a new user account with hashed password storage.

* *URL:* /register
* *Method:* POST
* *Headers:* Content-Type: application/json
* *Request Body:*
  ```json
  {
    "FullName": "Boitumelo Dupwa",
    "Email": "boitumelo@example.com",
    "Password": "securepassword123",
    "WeeklyBudget": 600.00,
    "DietaryPreference": "vegetarian"
  }