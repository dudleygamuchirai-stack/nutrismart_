import React, { useState } from 'react';
import './ShoppingListItem.css';

export default function ShoppingListItem({ name, quantity, unit, price, checked: initialChecked = false }) {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <div className={`shopping-item ${checked ? 'completed' : ''}`}>
      <label className="shopping-checkbox-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked(!checked)}
          className="shopping-checkbox"
        />
        <div className="shopping-item-details">
          <span className="shopping-item-name">{name}</span>
          <span className="shopping-item-qty">{quantity} {unit}</span>
        </div>
      </label>
      <span className="shopping-item-price">R{Number(price).toFixed(2)}</span>
    </div>
  );
}