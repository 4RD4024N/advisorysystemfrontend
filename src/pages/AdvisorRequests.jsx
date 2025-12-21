import { useState, useEffect } from 'react';
import { advisorService, authService } from '../services';

function AdvisorRequests() {
  const [myStudents, setMyStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    console.log('👤 Current User Info:', userInfo);
    console.log('🔑 User Role:', userInfo?.role);
    
    if (userInfo?.role === 'Advisor') {
      console.log('✅ User is Advisor - Loading students...');
      loadData();
    } else {
      console.warn('⚠️ User is not an Advisor. Role:', userInfo?.role);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await advisorService.getMyStudents();
      setMyStudents(data.students || []);
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
          👨‍� Öğrencilerim
        </h1>
        <p style={{ color: '#666' }}>Danışmanı olduğunuz öğrencileri görüntüleyin</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

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
      ) : (
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
