import React from 'react';
import './BudgetMeter.css';

export default function BudgetMeter({ budget = 500, spent = 418.50 }) {
  const percentage = Math.min(Math.round((spent / budget) * 100), 100);
  const remaining = (budget - spent).toFixed(2);
  const isOverBudget = spent > budget;

  return (
    <div className="budget-tracker-card">
      <div className="budget-labels">
        <span className="budget-title">Budget Tracker</span>
        <span>R{budget} budget</span>
      </div>
      <div className="budget-meter-track">
        <div 
          className={`budget-meter-fill ${isOverBudget ? 'over' : ''}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="budget-total">R{Number(spent).toFixed(2)}</div>
      <div className="budget-of">
        {isOverBudget 
          ? `R${Math.abs(remaining)} over budget · ${percentage}% used`
          : `of R${Number(budget).toFixed(2)} weekly budget · ${percentage}% used`}
      </div>
    </div>
  );
}