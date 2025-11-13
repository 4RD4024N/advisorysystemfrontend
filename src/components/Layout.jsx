import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">📚 Advisory</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/documents" className="nav-item">
            <span className="nav-icon">📄</span>
            <span className="nav-text">Documents</span>
          </NavLink>

          <NavLink to="/submissions" className="nav-item">
            <span className="nav-icon">📅</span>
            <span className="nav-text">Submissions</span>
          </NavLink>

          <NavLink to="/statistics" className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-text">Statistics</span>
          </NavLink>

          <NavLink to="/search" className="nav-item">
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Search</span>
          </NavLink>

          <NavLink to="/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <button 
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-title">
            <h1>Advisory System</h1>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
