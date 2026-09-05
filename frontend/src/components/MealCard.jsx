import React from 'react';
import './MealCard.css';

export default function MealCard({ meal, onSwap }) {
  const { type = 'Breakfast', name, prepTime = '15 mins', tag = 'High-Protein', cost = 24.50 } = meal;

  const typeClass = type.toLowerCase();

  return (
    <div className={`meal-card ${typeClass}`}>
      <div className="meal-card-top">
        <span className={`meal-type-badge ${typeClass}`}>{type}</span>
        <span className="meal-cost">R{Number(cost).toFixed(2)}</span>
      </div>

      <h4 className="meal-name">{name}</h4>

      <div className="meal-meta">
        <span className="meal-prep">⏱️ {prepTime}</span>
        <span className="meal-tag">🏷️ {tag}</span>
      </div>

      <button className="meal-swap-btn" onClick={() => onSwap && onSwap(meal)}>
        🔄 Swap Meal
      </button>
    </div>
  );
}