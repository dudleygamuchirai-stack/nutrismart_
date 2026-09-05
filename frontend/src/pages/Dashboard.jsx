import React from 'react';
import MealCard from '../components/MealCard';
import ShoppingListItem from '../components/ShoppingListItem';
import NutritionSummary from '../components/NutritionSummary';
import WeekView from '../components/WeekView';
import BudgetMeter from '../components/BudgetMeter';
import './Dashboard.css';

export default function Dashboard({ setActivePage, planData, featuredRecipe, onSwapRecipe }) {
  const remaining = (planData.budget - planData.spent).toFixed(2);
  const isWithinBudget = planData.spent <= planData.budget;

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h2>Good morning, Thabo 👋</h2>
        <p>Week of 19 – 25 May 2026 · Your meal plan is active</p>
      </header>

      {/* Dynamic KPI Cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Weekly Budget</span>
          <div className="kpi-value">R{planData.budget}</div>
          <span className="kpi-sub">
            {isWithinBudget ? `↓ R${remaining} remaining` : `↑ R${Math.abs(remaining)} over`}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Est. Spend</span>
          <div className="kpi-value">R{planData.spent.toFixed(2)}</div>
          <span className={`kpi-sub ${isWithinBudget ? 'highlight' : 'text-error'}`}>
            {isWithinBudget ? '✓ Within budget' : '⚠️ Exceeds budget'}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Meals Planned</span>
          <div className="kpi-value">{planData.mealsPlanned}</div>
          <span className="kpi-sub highlight">7 days complete</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Avg. Calories/day</span>
          <div className="kpi-value">{planData.calories.toLocaleString()}</div>
          <span className="kpi-sub highlight">↑ On target</span>
        </div>
      </section>

      {/* Dynamic Nutrition Summary */}
      <div style={{ marginBottom: '24px' }}>
        <NutritionSummary
          calories={planData.calories}
          protein={planData.protein}
          carbs={planData.carbs}
          fat={planData.fat}
        />
      </div>

      {/* Dynamic Featured Recipe with Swap Handler */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Fraunces', color: 'var(--color-navy)', marginBottom: '12px' }}>
          Featured Recipe
        </h3>
        <div style={{ maxWidth: '320px' }}>
          <MealCard meal={featuredRecipe} onSwap={onSwapRecipe} />
        </div>
      </div>

      {/* Main Grid */}
      <section className="dashboard-grid">
        <WeekView onRegenerate={() => setActivePage('generate')} />

        <div className="dash-sidebar">
          {/* Dynamic BudgetMeter */}
          <BudgetMeter budget={planData.budget} spent={planData.spent} />

          {/* Dynamic Groceries */}
          <div className="quick-actions-card">
            <h4>Checkers Shopping List</h4>
            {planData.groceries.map((grocery) => (
              <ShoppingListItem
                key={grocery.id}
                name={grocery.name}
                quantity={grocery.quantity}
                unit={grocery.unit}
                price={grocery.price}
                checked={grocery.checked}
              />
            ))}
          </div>

          <div className="quick-actions-card">
            <h4>Quick Actions</h4>
            <button className="action-btn primary" onClick={() => setActivePage('generate')}>
              ✨ Generate new plan
            </button>
            <button className="action-btn" onClick={() => setActivePage('palette')}>
              🎨 View Design Tokens
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}