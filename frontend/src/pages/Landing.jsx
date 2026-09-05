import React from 'react';
import './Landing.css';

export default function Landing({ setActivePage }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          Smart Grocery Planning for South Africa
        </div>

        <h1>
          Eat well. Spend less. <em>Stress never.</em>
        </h1>

        <p>
          Generate balanced 7-day meal plans optimized for your budget using real-time South African supermarket prices.
        </p>

        <div className="hero-btns">
          <button className="btn-primary" onClick={() => setActivePage('generate')}>
            ✨ Build My Meal Plan
          </button>
          <button className="btn-outline" onClick={() => setActivePage('dashboard')}>
            📊 View Sample Dashboard
          </button>
        </div>

        {/* Stats Strip */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num">R418<span>.50</span></div>
            <div className="hero-stat-lbl">Average Weekly Spend</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">21<span> meals</span></div>
            <div className="hero-stat-lbl">Planned in Under 60s</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num">100<span>%</span></div>
            <div className="hero-stat-lbl">SA Retail Matched</div>
          </div>
        </div>
      </header>

      {/* Feature Highlights */}
      <section className="features">
        <span className="section-eyebrow">Why NutriSmart SA</span>
        <h2 className="section-title">Designed for real South African kitchens and student budgets.</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Local Store Pricing</h3>
            <p>
              Ingredients are cross-referenced with staple product prices from Checkers and Pick n Pay.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Macro Tracking</h3>
            <p>
              Every meal plan automatically balances calories, proteins, carbohydrates, and healthy fats.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Automated Shopping Lists</h3>
            <p>
              Consolidate your week's meals into an itemized, checkable grocery list with exact pack weights and prices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}