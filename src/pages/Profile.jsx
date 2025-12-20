import React, { useState, useEffect } from 'react';
import { authService, advisorService } from '../services';

const Profile = () => {
  const [myAdvisor, setMyAdvisor] = useState(null);
  const [availableAdvisors, setAvailableAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    if (userInfo?.role === 'Student') {
      loadAdvisorInfo();
    }
  }, []);

  const loadAdvisorInfo = async () => {
    try {
      const data = await advisorService.getMyAdvisor();
      setMyAdvisor(data.hasAdvisor ? data.advisor : null);
    } catch (error) {
      console.error('Failed to load advisor info:', error);
    }
  };

  const handleRequestAdvisor = async () => {
    try {
      setLoading(true);
      
      // Önce mevcut advisorları yükle
      const advisors = await advisorService.getAvailableAdvisors();
      setAvailableAdvisors(advisors);
      setShowAdvisorModal(true);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Danışman listesi yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedAdvisor) {
      setMessage({ type: 'error', text: 'Lütfen bir danışman seçin' });
      return;
    }

    try {
      setLoading(true);
      await advisorService.requestAdvisor(selectedAdvisor);
      
      setMessage({
        type: 'success',
        text: 'Danışman talebiniz başarıyla gönderildi! Onay bekleniyor...'
      });
      
      setShowAdvisorModal(false);
      setSelectedAdvisor('');
      
      // Bilgiyi yenile
      setTimeout(() => loadAdvisorInfo(), 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Talep gönderilirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div>
      <h1 className="mb-4">Profile</h1>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-header">Account Information</h2>
          
          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Email</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {localStorage.getItem('userEmail') || 'Not available'}
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

        {/* Advisor Section - Only for Students */}
        {userInfo?.role === 'Student' && (
          <div className="card">
            <h2 className="card-header">👨‍🏫 My Advisor</h2>
            
            {myAdvisor ? (
              <div>
                <div className="alert alert-success">
                  <strong>✅ Danışman Atandı</strong>
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
                  <strong>ℹ️ Not:</strong> Danışman değiştirmek için lütfen yöneticiniz ile iletişime geçin.
                </div>
              </div>
            ) : (
              <div>
                <div className="alert alert-warning">
                  <strong>⚠️ Danışman Atanmamış</strong>
                  <p style={{ fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>
                    Henüz bir danışmanınız yok. Aşağıdaki butondan danışman talebi gönderebilirsiniz.
                  </p>
                </div>
                
                <button 
                  onClick={handleRequestAdvisor}
                  disabled={loading}
                  className="btn btn-primary w-100"
                >
                  {loading ? 'Yükleniyor...' : '📨 Danışman Talebi Gönder'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings card for non-students or second column */}
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
          <h2 className="card-header">Settings</h2>
          
          <div className="grid grid-2">
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
        </div>
      )}

      <div className="card mt-3">
        <h2 className="card-header">Help & Documentation</h2>
        <div className="grid grid-3">
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Documentation</div>
            <div className="text-sm text-muted">Check README.md for detailed guides</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔧</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>API Reference</div>
            <div className="text-sm text-muted">See API_QUICK_REFERENCE.md</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Support</div>
            <div className="text-sm text-muted">Contact your administrator</div>
          </div>
        </div>
      </div>

      {/* Advisor Selection Modal */}
      {showAdvisorModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAdvisorModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '16px' }}>👨‍🏫 Danışman Seç</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Talebinizi göndermek istediğiniz danışmanı seçin. Danışman talebinizi onayladığında size bildirim gönderilecektir.
            </p>

            <div className="mb-3">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Danışman
              </label>
              <select
                value={selectedAdvisor}
                onChange={(e) => setSelectedAdvisor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px'
                }}
              >
                <option value="">Bir danışman seçin...</option>
                {availableAdvisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.userName || advisor.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowAdvisorModal(false);
                  setSelectedAdvisor('');
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                İptal
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!selectedAdvisor || loading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {loading ? 'Gönderiliyor...' : '📨 Talep Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
