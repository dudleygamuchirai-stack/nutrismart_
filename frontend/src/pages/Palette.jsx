import React from 'react';
import './Palette.css';

export default function Palette() {
  const colorTokens = [
    { name: '--color-navy', hex: '#0D2F5E', role: 'Navbar, headings, card borders, primary brand base' },
    { name: '--color-primary', hex: '#1D9E75', role: 'CTAs, primary buttons, active links, progress bars' },
    { name: '--color-green-mid', hex: '#5EC8A0', role: 'Accents, secondary highlights, budget meter gradient' },
    { name: '--color-green-light', hex: '#E8F7F2', role: 'Tag fills, badges, selected row highlights' },
    { name: '--color-bg', hex: '#FDFAF5', role: 'Main application background' },
    { name: '--color-warm', hex: '#F5EFE0', role: 'Secondary cards, neutral fill containers' },
    { name: '--color-orange', hex: '#E8793A', role: 'Lunch chips, warning badges, budget alerts' },
    { name: '--color-orange-light', hex: '#FEF0E8', role: 'Lunch card backgrounds, warning chip fills' },
    { name: '--color-text', hex: '#1A1A1A', role: 'Primary readable body text' },
    { name: '--color-text-muted', hex: '#6B7280', role: 'Secondary captions, timestamps, table headers' },
    { name: '--color-border', hex: '#E5E7EB', role: 'Card outlines, dividing rules, inputs' },
    { name: '--color-error', hex: '#D63031', role: 'Over-budget warnings, destructive buttons' }
  ];

  return (
    <div className="palette-container">
      <header className="palette-header">
        <span className="section-eyebrow">Design System</span>
        <h2>NutriSmart SA Tokens & UI Kit</h2>
        <p>Documentation of typography, color tokens, and atomic components (Doc Page 34).</p>
      </header>

      {/* Color Swatches */}
      <section className="palette-section">
        <h3>Color Palette</h3>
        <div className="swatch-grid">
          {colorTokens.map((token) => (
            <div key={token.name} className="swatch-card">
              <div className="swatch-color" style={{ background: token.hex }}></div>
              <div className="swatch-details">
                <span className="swatch-name">{token.name}</span>
                <span className="swatch-hex">{token.hex}</span>
                <p className="swatch-desc">{token.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Scale */}
      <section className="palette-section">
        <h3>Typography Scale</h3>
        <div className="type-card">
          <div className="type-row">
            <span className="type-meta">Fraunces · 32px · Bold</span>
            <h1 className="sample-h1">Eat well. Spend less. Stress never.</h1>
          </div>
          <div className="type-row">
            <span className="type-meta">Fraunces · 24px · SemiBold</span>
            <h2 className="sample-h2">Weekly Meal Plan & Budget</h2>
          </div>
          <div className="type-row">
            <span className="type-meta">DM Sans · 16px · Regular</span>
            <p className="sample-body">
              NutriSmart SA generates personalised 7-day meal plans using real local grocery prices from Checkers and Pick n Pay.
            </p>
          </div>
          <div className="type-row">
            <span className="type-meta">DM Sans · 12px · UpperCase · SemiBold</span>
            <span className="sample-caption">CAPTION / TABLE HEADER / METADATA</span>
          </div>
        </div>
      </section>

      {/* Buttons & Badges */}
      <section className="palette-section">
        <h3>Components & Badges</h3>
        <div className="components-preview-grid">
          <div className="preview-card">
            <h4>Buttons</h4>
            <div className="preview-row">
              <button className="btn-primary">Primary CTA</button>
              <button className="btn-outline-dark">Outline Button</button>
            </div>
          </div>
          <div className="preview-card">
            <h4>Meal Chips</h4>
            <div className="preview-row">
              <span className="meal-chip-demo breakfast">🥣 Breakfast Chip</span>
              <span className="meal-chip-demo lunch">🍛 Lunch Chip</span>
              <span className="meal-chip-demo dinner">🍗 Dinner Chip</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}