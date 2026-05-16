import { useState, useEffect } from 'react';
import { statisticsService } from '../services';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Kullanıcı istatistiklerini getir
      const data = await statisticsService.getStudentSummary();
      setStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
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
      <h1 className="mb-4">İstatistikler</h1>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex-between mb-3">
            <h3 style={{ margin: 0, fontSize: '18px' }}>Belgeler</h3>

          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--primary-color)' }}>
            {stats?.totalDocuments || 0}
          </div>
          <div className="text-muted text-sm mt-2">Oluşturulan toplam belge</div>
        </div>

        <div className="card">
          <div className="flex-between mb-3">
            <h3 style={{ margin: 0, fontSize: '18px' }}>Versiyonlar</h3>

          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--secondary-color)' }}>
            {stats?.totalVersions || 0}
          </div>
          <div className="text-muted text-sm mt-2">Yüklenen toplam versiyon</div>
        </div>

        <div className="card">
          <div className="flex-between mb-3">
            <h3 style={{ margin: 0, fontSize: '18px' }}>Bekleyen</h3>

          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--warning-color)' }}>
            {stats?.pendingSubmissions || 0}
          </div>
          <div className="text-muted text-sm mt-2">Bekleyen görevler</div>
        </div>

        <div className="card">
          <div className="flex-between mb-3">
            <h3 style={{ margin: 0, fontSize: '18px' }}>Tamamlanan</h3>

          </div>
          <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--secondary-color)' }}>
            {stats?.completedSubmissions || 0}
          </div>
          <div className="text-muted text-sm mt-2">Tamamlanan görevler</div>
        </div>
      </div>

      {stats && (
        <div className="card mt-3">
          <h2 className="card-header">Özet</h2>
          <div className="grid grid-2">
            <div>
              <div className="text-sm text-muted mb-1">Belge başına ortalama versiyon</div>
              <div style={{ fontSize: '24px', fontWeight: '600' }}>
                {stats.totalDocuments > 0
                  ? (stats.totalVersions / stats.totalDocuments).toFixed(1)
                  : 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted mb-1">Tamamlanma oranı</div>
              <div style={{ fontSize: '24px', fontWeight: '600' }}>
                {(stats.completedSubmissions + stats.pendingSubmissions) > 0
                  ? Math.round((stats.completedSubmissions / (stats.completedSubmissions + stats.pendingSubmissions)) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
