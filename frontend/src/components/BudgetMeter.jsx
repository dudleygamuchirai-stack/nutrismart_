
import React from 'react';
import './BudgetMeter.css';

export default function BudgetMeter({
  budget = 500,
  spent = 0
}) {
  const safeBudget = Math.max(Number(budget) || 0, 0);
  const safeSpent = Math.max(Number(spent) || 0, 0);

  const percentage =
    safeBudget > 0
      ? Math.round((safeSpent / safeBudget) * 100)
      : 0;

  const remaining = safeBudget - safeSpent;
  const isOverBudget = remaining < 0;

  const progressWidth =
    safeBudget > 0
      ? Math.min(percentage, 100)
      : 0;

  return (
    <div className="budget-tracker-card">
      <div className="budget-labels">
        <span className="budget-title">Budget Tracker</span>
        <span>R{safeBudget.toFixed(2)} budget</span>
      </div>

      <div
        className="budget-meter-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Weekly budget used"
      >
        <div
          className={`budget-meter-fill ${
            isOverBudget ? 'over' : ''
          }`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className="budget-total">
        R{safeSpent.toFixed(2)}
      </div>

      <div className="budget-of">
        {isOverBudget
          ? `R${Math.abs(remaining).toFixed(2)} over budget · ${percentage}% used`
          : `R${remaining.toFixed(2)} remaining · ${percentage}% used`}
      </div>
    </div>
  );
}
