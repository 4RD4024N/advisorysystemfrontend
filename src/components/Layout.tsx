import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService, notificationService } from '../services';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userInfo = authService.getUserInfo();
    setUserRole(userInfo?.role);

    loadUnreadCount();
    
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0); // Set 0 on error to prevent UI issues
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">BEDES</h2>
          {authService.getUserInfo() && (
            <div className="user-info">
              <div className="user-avatar">
                {authService.getUserInfo().email?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{authService.getUserInfo().email?.split('@')[0]}</div>
                <div className="user-role">{userRole}</div>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-item">
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink to="/documents" className="nav-item">
            <span className="nav-text">Documents</span>
          </NavLink>

          {userRole === 'Student' && (
            <NavLink to="/submissions" className="nav-item">
              <span className="nav-text">Submissions</span>
            </NavLink>
          )}

          <NavLink to="/search" className="nav-item">
            <span className="nav-text">Search</span>
          </NavLink>

          <div className="nav-divider"></div>

          <NavLink to="/notifications" className="nav-item">
            <span className="nav-text">Notifications
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </span>
          </NavLink>

          <NavLink to="/statistics" className="nav-item">
            <span className="nav-text">Statistics</span>
          </NavLink>

          <div className="nav-divider"></div>

          {/* Student Only: My Profile */}
          {userRole === 'Student' && (
            <NavLink to="/student-profile" className="nav-item">
              <span className="nav-text">My Profile</span>
            </NavLink>
          )}

          <NavLink to="/courses" className="nav-item">
            <span className="nav-text">Courses</span>
          </NavLink>

          {/* Student & Advisor: Course Schedule */}
          {(userRole === 'Student' || userRole === 'Advisor') && (
            <NavLink to="/course-schedule" className="nav-item">
              <span className="nav-text">Ders Programı</span>
            </NavLink>
          )}

          {(userRole === 'Admin' || userRole === 'Advisor') && (
            <>
              <div className="nav-divider"></div>
              
              {(userRole === 'Admin' || userRole === 'Advisor') && (
                <NavLink to="/students" className="nav-item">
                  <span className="nav-text">Students</span>
                </NavLink>
              )}

              {userRole === 'Admin' && (
                <NavLink to="/assign-advisor" className="nav-item">
                  <span className="nav-text">Öğretmen Atama</span>
                </NavLink>
              )}

              {/* Advisor Only: Create Submission */}
              {userRole === 'Advisor' && (
                <NavLink to="/create-submission" className="nav-item">
                  <span className="nav-text">Set Deadline</span>
                </NavLink>
              )}
            </>
          )}
        
          <div className="nav-divider"></div>

          <NavLink to="/profile" className="nav-item">
            <span className="nav-text">Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn">
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <button 
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-title">
            <h1>BEDES</h1>
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