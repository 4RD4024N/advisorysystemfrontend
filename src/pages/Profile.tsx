import { useState, useEffect } from 'react';
import { authService, advisorService } from '../services';
import { logger } from '../utils/logger';

interface AdvisorInfo {
  email: string;
  userName?: string;
  userId?: string;
}

const Profile = () => {
  const [myAdvisor, setMyAdvisor] = useState<AdvisorInfo | null>(null);
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    if (userInfo?.role === 'Student') {
      loadAdvisorInfo();
    }
  }, []);

  const loadAdvisorInfo = async () => {
    try {
      const data = await advisorService.getMyAdvisor();
      logger.debug('Advisor API response:', data);
      
      // Handle response: data has {hasAdvisor: boolean, advisor: {...} | null}
      if (data.hasAdvisor && data.advisor) {
        setMyAdvisor(data.advisor);
      } else {
        setMyAdvisor(null);
      }
    } catch (error) {
      logger.error('Failed to load advisor info', error as Error);
      setMyAdvisor(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div>
      <h1 className="mb-4">Profile</h1>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-header">Account Information</h2>

          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Email</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {userInfo?.email || 'Not available'}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Role</div>
            <span className="badge badge-primary">{userInfo?.role || 'Unknown'}</span>
          </div>

          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Account Status</div>
            <span className="badge badge-success">Active</span>
          </div>

          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        {userInfo?.role === 'Student' && (
          <div className="card">
            <h2 className="card-header">Danışmanım</h2>

            {myAdvisor ? (
              <div>
                <div className="alert alert-success">
                  <strong>Danışman Atandı</strong>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-muted mb-1">Danışman Adı</div>
                  <div style={{ fontSize: '16px', fontWeight: '500' }}>
                    {myAdvisor.userName || myAdvisor.email}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-muted mb-1">Email</div>
                  <div style={{ fontSize: '14px' }}>
                    {myAdvisor.email}
                  </div>
                </div>

                <div className="alert alert-info" style={{ fontSize: '13px' }}>
                  <strong>Not:</strong> Danışman değiştirmek için lütfen yöneticiniz ile iletişime geçin.
                </div>
              </div>
            ) : (
              <div>
                <div className="alert alert-warning">
                  <strong>Danışman Atanmamış</strong>
                  <p style={{ fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
                    Henüz bir danışmanınız yok. Danışman atanması için lütfen yöneticiniz ile iletişime geçin.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {userInfo?.role !== 'Student' && (
          <div className="card">
            <h2 className="card-header">Settings</h2>

            <div className="alert alert-info">
              <strong>Note:</strong> Additional profile settings and preferences will be available in future updates.
            </div>

            <div className="mb-3">
              <div className="text-sm text-muted mb-1">API Base URL</div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                https://localhost:7175/api
              </div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-muted mb-1">Token Status</div>
              <span className={`badge ${authService.isAuthenticated() ? 'badge-success' : 'badge-danger'}`}>
                {authService.isAuthenticated() ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>
        )}
      </div>


      {/* Settings card for students - full width below */}
      {userInfo?.role === 'Student' && (
        <div className="card mt-3">
          <h2 className="card-header">Ayarlar</h2>

          <div className="grid grid-2">
            <div className="mb-3">
              <div className="text-sm text-muted mb-1">API Base URL</div>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
                https://localhost:7175/api
              </div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-muted mb-1">Token Durumu</div>
              <span className={`badge ${authService.isAuthenticated() ? 'badge-success' : 'badge-danger'}`}>
                {authService.isAuthenticated() ? 'Geçerli' : 'Geçersiz'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <h2 className="card-header">Yardım & Dokümantasyon</h2>
        <div className="grid grid-3">
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>Docs</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Dokümantasyon</div>
            <div className="text-sm text-muted">Detaylı rehberler için README.md dosyasına bakın</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>Settings</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>API Referansı</div>
            <div className="text-sm text-muted">API_QUICK_REFERENCE.md dosyasına bakın</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>Help</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Destek</div>
            <div className="text-sm text-muted">Danışmanla iletişim</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
