import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statisticsService, documentService } from '../services';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, docsData] = await Promise.all([
        statisticsService.getStudentSummary().catch(() => null),
        documentService.getMyDocuments().catch(() => [])
      ]);
      
      setStats(statsData);
      setRecentDocs(docsData.slice(0, 5));
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
        <h1>Dashboard</h1>
        <Link to="/documents" className="btn btn-primary">
          + New Document
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-3 mb-4">
        <div className="card">
          <div className="text-muted text-sm mb-1">Total Documents</div>
          <div className="text-lg" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)' }}>
            {stats?.totalDocuments || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-muted text-sm mb-1">Total Versions</div>
          <div className="text-lg" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--secondary-color)' }}>
            {stats?.totalVersions || 0}
          </div>
        </div>

        <div className="card">
          <div className="text-muted text-sm mb-1">Pending Submissions</div>
          <div className="text-lg" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning-color)' }}>
            {stats?.pendingSubmissions || 0}
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="card">
        <div className="flex-between mb-3">
          <h2 className="card-header" style={{ marginBottom: 0 }}>Recent Documents</h2>
          <Link to="/documents" className="text-sm text-primary">View All →</Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-text">No documents yet</div>
            <div className="empty-state-subtext">Create your first document to get started</div>
            <Link to="/documents" className="btn btn-primary mt-3">
              Create Document
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Title</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Tags</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Versions</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '14px' }}>Created</th>
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
