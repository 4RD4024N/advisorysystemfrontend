import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statisticsService, documentService, advisorService, authService } from '../services';

const Dashboard = () => {
  const userInfo = authService.getUserInfo();
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [advisor, setAdvisor] = useState(null);
  const [myStudents, setMyStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboard = async () => {
    try {
      const promises = [
        statisticsService.getStudentSummary().catch(() => null),
        documentService.getMyDocuments().catch(() => [])
      ];

      if (userInfo?.role === 'Student') {
        promises.push(advisorService.getMyAdvisor().catch(() => null));
      }

      if (userInfo?.role === 'Advisor') {
        promises.push(advisorService.getMyStudents().catch(() => null));
      }

      const results = await Promise.all(promises);

      setStats(results[0]);
      setRecentDocs(results[1].slice(0, 5));

      if (userInfo?.role === 'Student' && results[2]) {
        setAdvisor(results[2]);
      }

      if (userInfo?.role === 'Advisor' && results[2]) {
        setMyStudents(results[2]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Ana Sayfa</h1>
        <Link to="/documents" className="btn btn-primary">
          + Yeni Belge
        </Link>
      </div>

      {userInfo?.role === 'Student' && advisor && (
        <div className="card mb-4" style={{
          background: advisor.hasAdvisor
            ? 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)'
            : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: advisor.hasAdvisor ? '2px solid #3b82f6' : '2px solid #f59e0b'
        }}>
          <h2 className="card-header" style={{ marginBottom: '1rem' }}>👨‍🏫 Danışmanım</h2>
          {advisor.hasAdvisor ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#14171a', marginBottom: '0.5rem' }}>
                  {advisor.advisor.userName}
                </div>
                <div style={{ color: '#657786', fontSize: '0.95rem' }}>
                  {advisor.advisor.email}
                </div>
              </div>
              <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Atandı
              </span>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
              <p style={{ color: '#657786', margin: 0 }}>Henüz danışman atanmadı</p>
            </div>
          )}
        </div>
      )}

      {/* ✨ NEW v2.1: Student Count for Advisors */}
      {userInfo?.role === 'Advisor' && myStudents && (
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b'
        }}>
          <div className="flex-between mb-3">
            <h2 className="card-header" style={{ marginBottom: 0 }}>Öğrencilerim</h2>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {myStudents.totalStudents || 0}
            </div>
          </div>
          <p style={{ color: '#657786', margin: 0, fontSize: '0.95rem' }}>
            {myStudents.totalStudents || 0} öğrenciye danışmanlık yapıyorsunuz
          </p>
        </div>
      )}


      <div className="grid grid-3 mb-4">
        <div className="card">
          <div className="text-muted text-sm mb-1">Toplam Belge</div>
          <div className="text-lg" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)' }}>
            {stats?.totalDocuments || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-muted text-sm mb-1">Toplam Versiyon</div>
          <div className="text-lg" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--secondary-color)' }}>
            {stats?.totalVersions || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-muted text-sm mb-1">Bekleyen Görevler</div>
          <div className="text-lg" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning-color)' }}>
            {stats?.pendingSubmissions || 0}
          </div>
        </div>
      </div>


      <div className="card">
        <div className="flex-between mb-3">
          <h2 className="card-header" style={{ marginBottom: 0 }}>Son Belgeler</h2>
          <Link to="/documents" className="text-sm text-primary">Tümünü Gör →</Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-text">Henüz belge yok</div>
            <div className="empty-state-subtext">Başlamak için ilk belgenizi oluşturun</div>
            <Link to="/documents" className="btn btn-primary mt-3">
              Belge Oluştur
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Başlık</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Etiketler</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Versiyonlar</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Oluşturuldu</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>
                      <Link to={`/documents/${doc.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                        {doc.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {doc.tags && doc.tags.split(',').slice(0, 2).map((tag, i) => (
                        <span key={i} className="badge badge-primary" style={{ marginRight: '4px' }}>
                          {tag.trim()}
                        </span>
                      ))}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-success">{doc.versionCount || 0}</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
