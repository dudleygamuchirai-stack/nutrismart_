import React from 'react';
import './Navbar.css';

export default function Navbar({ activePage, setActivePage }) {
  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => setActivePage('landing')}>
        <span className="nav-logo-dot"></span>
        NutriSmart SA
      </div>

      <div className="nav-links">
        <button
          className={`nav-link ${activePage === 'landing' ? 'active' : ''}`}
          onClick={() => setActivePage('landing')}
        >
          Home
        </button>
        <button
          className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-link ${activePage === 'generate' ? 'active' : ''}`}
          onClick={() => setActivePage('generate')}
        >
          Generate Plan
        </button>
        <button
          className={`nav-link ${activePage === 'palette' ? 'active' : ''}`}
          onClick={() => setActivePage('palette')}
        >
          Design Guide
        </button>
      </div>

      <div className="nav-right">
        <div className="nav-avatar" title="Thabo Mokoena">
          TM
        </div>
      </div>
    </nav>
  );
}