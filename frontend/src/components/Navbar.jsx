import React from 'react';
import './Navbar.css';

export default function Navbar({
  activePage,
  setActivePage,
  user,
  onLogout
}) {
  return (
    <nav className="navbar">
      <div
        className="nav-logo"
        onClick={() => setActivePage('landing')}
        style={{ cursor: 'pointer' }}
      >
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

        {user ? (
          <>
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
          </>
        ) : (
          <>
            <button
              className="nav-link"
              onClick={() => setActivePage('login')}
            >
              Log In
            </button>

            <button
              className="nav-link"
              onClick={() => setActivePage('register')}
            >
              Register
            </button>
          </>
        )}
      </div>

      {user && (
        <div className="nav-right">
          <span style={{ color: 'white', marginRight: '12px' }}>
            {user.FullName}
          </span>

          <button
            type="button"
            className="nav-link"
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
}