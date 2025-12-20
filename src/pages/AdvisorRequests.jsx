import { useState, useEffect } from 'react';
import { advisorService, authService } from '../services';

function AdvisorRequests() {
  const [pendingRequests, setRequests] = useState([]);
  const [myStudents, setMyStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'students'
  const [message, setMessage] = useState({ type: '', text: '' });
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    if (userInfo?.role === 'Advisor') {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'requests') {
        const data = await advisorService.getPendingRequests();
        setRequests(Array.isArray(data) ? data : []);
      } else {
        const data = await advisorService.getMyStudents();
        setMyStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({
        type: 'error',
        text: 'Veriler yüklenirken hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!confirm('Bu öğrenci talebini onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await advisorService.acceptRequest(requestId);
      setMessage({
        type: 'success',
        text: '✅ Talep onaylandı! Öğrenci bilgilendirildi.'
      });
      
      // Listeyi yenile
      setTimeout(() => {
        loadData();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Talep onaylanırken hata oluştu'
      });
    }
  };

  const handleReject = async (requestId) => {
    if (!confirm('Bu talebi reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await advisorService.rejectRequest(requestId);
      setMessage({
        type: 'success',
        text: '✅ Talep reddedildi.'
      });
      
      // Listeyi yenile
      setTimeout(() => {
        loadData();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Talep reddedilirken hata oluştu'
      });
    }
  };

  if (userInfo?.role !== 'Advisor') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="alert alert-danger">
          <strong>⛔ Erişim Engellendi</strong>
          <p>Bu sayfaya sadece danışmanlar erişebilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          👨‍🏫 Danışmanlık Yönetimi
        </h1>
        <p style={{ color: '#666' }}>Öğrenci taleplerinizi yönetin ve öğrencilerinizi görüntüleyin</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        borderBottom: '2px solid #e0e0e0',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'requests' ? '3px solid #0066cc' : 'none',
            color: activeTab === 'requests' ? '#0066cc' : '#666',
            fontWeight: activeTab === 'requests' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📨 Bekleyen Talepler
        </button>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'students' ? '3px solid #0066cc' : 'none',
            color: activeTab === 'students' ? '#0066cc' : '#666',
            fontWeight: activeTab === 'students' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          👨‍🎓 Öğrencilerim ({myStudents.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #0066cc',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#666' }}>Yükleniyor...</p>
        </div>
      ) : activeTab === 'requests' ? (
        /* Pending Requests */
        <div>
          {pendingRequests.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#f9f9f9',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <h3 style={{ marginBottom: '8px' }}>Bekleyen Talep Yok</h3>
              <p style={{ color: '#666' }}>Şu anda bekleyen öğrenci talebiniz bulunmuyor.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {pendingRequests.map((request) => (
                <div 
                  key={request.id}
                  className="card"
                  style={{ 
                    padding: '20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        {request.student?.userName || request.student?.email}
                      </h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        {request.student?.email}
                      </p>
                    </div>
                    <span className="badge badge-warning">Bekliyor</span>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '12px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        Talep Tarihi
                      </div>
                      <div style={{ fontWeight: '500' }}>
                        {new Date(request.requestedAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        Saat
                      </div>
                      <div style={{ fontWeight: '500' }}>
                        {new Date(request.requestedAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="btn btn-success"
                      style={{ flex: 1 }}
                    >
                      ✅ Onayla
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                    >
                      ❌ Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* My Students */
        <div>
          {myStudents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#f9f9f9',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🎓</div>
              <h3 style={{ marginBottom: '8px' }}>Henüz Öğrenciniz Yok</h3>
              <p style={{ color: '#666' }}>
                Öğrenci taleplerinizi onayladığınızda bu listede görünecekler.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px 16px',
                background: '#e3f2fd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>ℹ️</span>
                <span>
                  <strong>{myStudents.length}</strong> öğrenciniz bulunmaktadır
                </span>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {myStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="card"
                    style={{ 
                      padding: '20px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div>
                        <h3 style={{ 
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '4px'
                        }}>
                          {student.userName || student.email}
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                          📧 {student.email}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-success">
                            Aktif Öğrenci
                          </span>
                          {student.emailConfirmed && (
                            <span className="badge badge-info">
                              ✅ Email Onaylı
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdvisorRequests;
