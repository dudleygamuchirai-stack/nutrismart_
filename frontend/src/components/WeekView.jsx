import React from 'react';
import './WeekView.css';

const DEFAULT_WEEK_SCHEDULE = [
  { day: 'MON', breakfast: '🥣 Jungle Oats', lunch: '🍛 Pap & Chakalaka', dinner: '🍗 Grilled Chicken' },
  { day: 'TUE', breakfast: '🍞 Egg Toast', lunch: '🥗 Tuna Salad', dinner: '🍲 Lentil Stew' },
  { day: 'WED', breakfast: '🥛 Yoghurt & Fruit', lunch: '🍱 Rice & Beans', dinner: '🥩 Beef Stew' },
  { day: 'THU', breakfast: '🥣 Jungle Oats', lunch: '🥙 Veg Wrap', dinner: '🍗 Grilled Chicken' },
  { day: 'FRI', breakfast: '🍞 Peanut Butter', lunch: '🍛 Pap & Spinach', dinner: '🐟 Hake & Chips' },
  { day: 'SAT', breakfast: '🍳 Scrambled Eggs', lunch: '🥗 Coleslaw Roll', dinner: '🍖 Braai Pack' },
  { day: 'SUN', breakfast: '🥞 Vetkoek', lunch: '🍲 Umngqusho', dinner: '🍗 Sunday Roast' }
];

export default function WeekView({ schedule = DEFAULT_WEEK_SCHEDULE, onRegenerate }) {
  return (
    <div className="week-view-container">
      <div className="week-view-header">
        <div>
          <h3>This Week's Plan</h3>
          <span>19 – 25 May 2026</span>
        </div>
        {onRegenerate && (
          <button className="btn-sm" onClick={onRegenerate}>
            Regenerate
          </button>
        )}
      </div>

      <div className="week-grid">
        {schedule.map((item) => (
          <div key={item.day} className="day-col">
            <div className="day-title">{item.day}</div>
            <div className="meal-chip breakfast">{item.breakfast}</div>
            <div className="meal-chip lunch">{item.lunch}</div>
            <div className="meal-chip dinner">{item.dinner}</div>
          </div>
        ))}
      </div>
    </div>
  );
}