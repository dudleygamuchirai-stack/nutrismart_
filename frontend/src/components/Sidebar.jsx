
import React from 'react';
import './Sidebar.css';

export default function Sidebar({ activePage, setActivePage, user }) {
  const fullName = user?.FullName || 'NutriSmart User';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleScrollToPlan = () => {
    if (activePage !== 'dashboard') {
      setActivePage('dashboard');
      setTimeout(() => {
        const el =
          document.querySelector('.dashboard-grid') ||
          document.querySelector('.kpi-grid');

        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el =
        document.querySelector('.dashboard-grid') ||
        document.querySelector('.kpi-grid');

      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <span className="sidebar-label">MAIN</span>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span className="sidebar-icon">📊</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'generate' ? 'active' : ''}`}
            onClick={() => setActivePage('generate')}
          >
            <span className="sidebar-icon">✨</span>
            Generate Plan
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={handleScrollToPlan}
          >
            <span className="sidebar-icon">📅</span>
            My Plan
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'shopping' ? 'active' : ''}`}
            onClick={() => setActivePage('shopping')}
          >
            <span className="sidebar-icon">🛒</span>
            Shopping List
          </button>
        </nav>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">ACCOUNT</span>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => setActivePage('history')}
          >
            <span className="sidebar-icon">📋</span>
            Plan History
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'saved' ? 'active' : ''}`}
            onClick={() => setActivePage('saved')}
          >
            <span className="sidebar-icon">📁</span>
            Saved Plans
          </button>

          <button
            type="button"
            className={`sidebar-link ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            <span className="sidebar-icon">👤</span>
            Profile
          </button>
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>

        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{fullName}</span>
          <span className="sidebar-user-tier">Free plan</span>
        </div>
      </div>
    </aside>
  );
}
