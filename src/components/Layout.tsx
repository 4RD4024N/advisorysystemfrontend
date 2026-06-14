import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { authService, notificationService } from '../services';
import bedesLogo from '../../bedeslogo.png';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const isMobile = () => window.innerWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<string | string[] | null>(null);

  useEffect(() => {
    const userInfo = authService.getUserInfo();
    setUserRole(userInfo?.role || null);

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 30000);

    const handleResize = () => {
      if (!isMobile()) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
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

  const closeSidebarOnMobile = () => {
    if (isMobile()) setSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && isMobile() && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={bedesLogo} alt="BEDES" className="sidebar-logo" />
          {authService.getUserInfo() && (
            <div className="user-info">
              <div className="user-avatar">
                {authService.getUserInfo()?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{authService.getUserInfo()?.email?.split('@')[0]}</div>
                <div className="user-role">{userRole}</div>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">Ana Sayfa</span>
          </NavLink>

          <NavLink to="/documents" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">Belgeler</span>
          </NavLink>

          {userRole === 'Student' && (
            <NavLink to="/submissions" className="nav-item" onClick={closeSidebarOnMobile}>
              <span className="nav-text">Görevler</span>
            </NavLink>
          )}

          <NavLink to="/search" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">Arama</span>
          </NavLink>

          <div className="nav-divider"></div>

          <NavLink to="/notifications" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">Bildirimler
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </span>
          </NavLink>

          <NavLink to="/statistics" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">İstatistikler</span>
          </NavLink>

          <div className="nav-divider"></div>

          {/* Student Only: My Profile */}
          {userRole === 'Student' && (
            <NavLink to="/student-profile" className="nav-item" onClick={closeSidebarOnMobile}>
              <span className="nav-text">Profilim</span>
            </NavLink>
          )}

          <NavLink to="/courses" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">Dersler</span>
          </NavLink>

          {/* Student & Advisor: Course Schedule */}
          {(userRole === 'Student' || userRole === 'Advisor') && (
            <NavLink to="/course-schedule" className="nav-item" onClick={closeSidebarOnMobile}>
              <span className="nav-text">Ders Programı</span>
            </NavLink>
          )}

          {(userRole === 'Admin' || userRole === 'Advisor') && (
            <>
              <div className="nav-divider"></div>

              {(userRole === 'Admin' || userRole === 'Advisor') && (
                <NavLink to="/students" className="nav-item" onClick={closeSidebarOnMobile}>
                  <span className="nav-text">Öğrenciler</span>
                </NavLink>
              )}

              {userRole === 'Admin' && (
                <NavLink to="/assign-advisor" className="nav-item" onClick={closeSidebarOnMobile}>
                  <span className="nav-text">Öğretmen Atama</span>
                </NavLink>
              )}

              {/* Advisor Only: Create Submission */}
              {userRole === 'Advisor' && (
                <NavLink to="/create-submission" className="nav-item" onClick={closeSidebarOnMobile}>
                  <span className="nav-text">Son Tarih Belirle</span>
                </NavLink>
              )}
            </>
          )}

          <div className="nav-divider"></div>

          <NavLink to="/profile" className="nav-item" onClick={closeSidebarOnMobile}>
            <span className="nav-text">Profil</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => { handleLogout(); closeSidebarOnMobile(); }} className="nav-item logout-btn">
            <span className="nav-text">Çıkış Yap</span>
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