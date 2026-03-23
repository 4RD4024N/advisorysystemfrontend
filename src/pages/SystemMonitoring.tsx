import { useState, useEffect } from 'react';
import { storageService, healthService } from '../services';
import './SystemMonitoring.css';

function SystemMonitoring() {
  const [activeTab, setActiveTab] = useState('storage');
  const [loading, setLoading] = useState(true);
  
  const [storageInfo, setStorageInfo] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [filesList, setFilesList] = useState([]);
  
  const [healthStatus, setHealthStatus] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'storage') {
        await loadStorageData();
      } else if (activeTab === 'health') {
        await loadHealthData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageData = async () => {
    try {
      const [info, stats, filesResponse] = await Promise.all([
        storageService.getInfo(),
        storageService.getStatistics(),
        storageService.listFiles()
      ]);
      
      setStorageInfo(info);
      setStorageStats(stats);
      setFilesList(Array.isArray(filesResponse?.files) ? filesResponse.files : []);
    } catch (error) {
      console.error('Failed to load storage data:', error);
      setStorageInfo(null);
      setStorageStats(null);
      setFilesList([]);
    }
  };

  const loadHealthData = async () => {
    try {
      const [health, system, metricsData, db] = await Promise.all([
        healthService.getDetailedHealth(),
        healthService.getSystemInfo(),
        healthService.getMetrics(),
        healthService.checkDatabase()
      ]);
      
      setHealthStatus(health);
      setSystemInfo(system);
      setMetrics(metricsData);
      setDbHealth(db);
    } catch (error) {
      console.error('Failed to load health data:', error);
      setHealthStatus(null);
      setSystemInfo(null);
      setMetrics(null);
      setDbHealth(null);
    }
  };

  const handleCleanupOrphaned = async () => {
    if (!confirm('Clean up orphaned files? This will delete files without database records.')) {
      return;
    }

    try {
      const result = await storageService.cleanupOrphanedFiles();
      alert(`Cleanup complete! Deleted ${result.deletedCount} orphaned files.`);
      loadStorageData();
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('Cleanup failed: ' + error.message);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    if (status === 'Healthy' || status === 'Up') return 'status-healthy';
    if (status === 'Degraded') return 'status-warning';
    return 'status-error';
  };

  return (
    <div className="monitoring-page">
      <div className="monitoring-header">
        <h1>System Monitoring</h1>
        <p>Storage management and health monitoring</p>
      </div>

      <div className="monitoring-tabs">
        <button 
          className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
          onClick={() => setActiveTab('storage')}
        >
          💾 Storage Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          🏥 Health & Performance
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <>
          {activeTab === 'storage' && (
            <div className="storage-section">
              {/* Storage Statistics */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">Files</div>
                  <div className="stat-info">
                    <h3>Total Files</h3>
                    <p className="stat-value">{storageStats?.totalFiles || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💽</div>
                  <div className="stat-info">
                    <h3>Total Size</h3>
                    <p className="stat-value">{formatBytes(storageStats?.totalSize || 0)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">Stats</div>
                  <div className="stat-info">
                    <h3>Average File Size</h3>
                    <p className="stat-value">{formatBytes(storageStats?.averageSize || 0)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">Warning</div>
                  <div className="stat-info">
                    <h3>Orphaned Files</h3>
                    <p className="stat-value">{storageStats?.orphanedCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div className="info-section">
                <h2>Storage Configuration</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Upload Path:</span>
                    <span className="info-value">{storageInfo?.uploadPath || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Max File Size:</span>
                    <span className="info-value">{formatBytes(storageInfo?.maxFileSize || 0)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Allowed Extensions:</span>
                    <span className="info-value">{storageInfo?.allowedExtensions?.join(', ') || 'All'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="actions-section">
                <button 
                  className="btn-danger"
                  onClick={handleCleanupOrphaned}
                  disabled={!storageStats?.orphanedCount}
                >
                  🗑️ Cleanup Orphaned Files
                </button>
                <button 
                  className="btn-secondary"
                  onClick={loadStorageData}
                >
                  🔄 Refresh
                </button>
              </div>

              {/* Files List */}
              <div className="files-section">
                <h2>Recent Files ({Array.isArray(filesList) ? filesList.length : 0})</h2>
                {!Array.isArray(filesList) || filesList.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <p>No files in storage</p>
                  </div>
                ) : (
                  <div className="files-table">
                    <table>
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Size</th>
                          <th>Created</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filesList.slice(0, 20).map((file, index) => (
                          <tr key={index}>
                            <td>{file.fileName}</td>
                            <td>{formatBytes(file.size)}</td>
                            <td>{new Date(file.createdAt).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${file.hasRecord ? 'badge-success' : 'badge-warning'}`}>
                                {file.hasRecord ? 'Active' : 'Orphaned'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="health-section">
              {/* Overall Health Status */}
              <div className="health-overview">
                <div className={`health-status ${getStatusColor(healthStatus?.status)}`}>
                  <h2>{healthStatus?.status || 'Unknown'}</h2>
                  <p>Overall System Status</p>
                </div>
              </div>

              {/* Health Components */}
              <div className="health-grid">
                <div className="health-card">
                  <h3>🗄️ Database</h3>
                  <div className={`status-indicator ${getStatusColor(dbHealth?.status)}`}>
                    {dbHealth?.status || 'Unknown'}
                  </div>
                  <p className="health-detail">
                    Response Time: {dbHealth?.responseTime}ms
                  </p>
                </div>

                <div className="health-card">
                  <h3>💾 Storage</h3>
                  <div className={`status-indicator ${getStatusColor(healthStatus?.storage)}`}>
                    {healthStatus?.storage || 'Unknown'}
                  </div>
                  <p className="health-detail">
                    {storageStats?.totalFiles || 0} files
                  </p>
                </div>

                <div className="health-card">
                  <h3>Authentication</h3>
                  <div className={`status-indicator ${getStatusColor(healthStatus?.auth)}`}>
                    {healthStatus?.auth || 'Unknown'}
                  </div>
                  <p className="health-detail">
                    JWT Active
                  </p>
                </div>

                <div className="health-card">
                  <h3>📡 API</h3>
                  <div className={`status-indicator ${getStatusColor(healthStatus?.api)}`}>
                    {healthStatus?.api || 'Unknown'}
                  </div>
                  <p className="health-detail">
                    {metrics?.totalRequests || 0} requests
                  </p>
                </div>
              </div>

              {/* System Information */}
              <div className="system-section">
                <h2>System Information</h2>
                <div className="system-grid">
                  <div className="system-item">
                    <span className="system-label">Platform:</span>
                    <span className="system-value">{systemInfo?.platform}</span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">OS Version:</span>
                    <span className="system-value">{systemInfo?.osVersion}</span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">CPU Usage:</span>
                    <span className="system-value">{systemInfo?.cpuUsage}%</span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">Memory:</span>
                    <span className="system-value">
                      {formatBytes(systemInfo?.usedMemory)} / {formatBytes(systemInfo?.totalMemory)}
                    </span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">Uptime:</span>
                    <span className="system-value">{systemInfo?.uptime}</span>
                  </div>
                  <div className="system-item">
                    <span className="system-label">.NET Version:</span>
                    <span className="system-value">{systemInfo?.dotnetVersion}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="metrics-section">
                <h2>Performance Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value">{metrics?.totalRequests || 0}</div>
                    <div className="metric-label">Total Requests</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{metrics?.activeUsers || 0}</div>
                    <div className="metric-label">Active Users</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{metrics?.avgResponseTime || 0}ms</div>
                    <div className="metric-label">Avg Response Time</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{metrics?.errorRate || 0}%</div>
                    <div className="metric-label">Error Rate</div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="actions-section">
                <button 
                  className="btn-secondary"
                  onClick={loadHealthData}
                >
                  🔄 Refresh Health Data
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SystemMonitoring;
