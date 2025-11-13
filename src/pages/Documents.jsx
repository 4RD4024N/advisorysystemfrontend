import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../services';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', tags: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await documentService.getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await documentService.createDocument(formData);
      setShowCreateModal(false);
      setFormData({ title: '', tags: '' });
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create document');
    } finally {
      setCreating(false);
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
        <h1>My Documents</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          + Create Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-text">No documents yet</div>
            <div className="empty-state-subtext">Create your first document to get started</div>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary mt-3">
              Create Document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {documents.map((doc) => (
            <div key={doc.id} className="card">
              <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>
                <Link to={`/documents/${doc.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {doc.title}
                </Link>
              </h3>
              
              <div className="mb-2">
                {doc.tags && doc.tags.split(',').map((tag, i) => (
                  <span key={i} className="badge badge-primary" style={{ marginRight: '6px', marginBottom: '6px' }}>
                    {tag.trim()}
                  </span>
                ))}
              </div>

              <div className="flex-between mt-3" style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div className="text-sm text-muted">
                  {doc.versionCount || 0} versions
                </div>
                <div className="text-sm text-muted">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>

              <Link to={`/documents/${doc.id}`} className="btn btn-secondary btn-sm mt-2" style={{ width: '100%', justifyContent: 'center' }}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Document</h2>
              <button onClick={() => setShowCreateModal(false)} className="modal-close">×</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleCreateDocument}>
              <div className="input-group">
                <label className="input-label">Document Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="My Thesis"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="research, thesis, software"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 1 }}>
                  {creating ? <span className="loading"></span> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: var(--text-secondary);
          line-height: 1;
          padding: 0;
          width: 32px;
          height: 32px;
        }

        .modal-close:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default Documents;
