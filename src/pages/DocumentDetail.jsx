import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentService, commentService } from '../services';

const DocumentDetail = () => {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadVersions();
  }, [id]);

  const loadVersions = async () => {
    try {
      const data = await documentService.getVersions(id);
      setVersions(data);
      if (data.length > 0) {
        setSelectedVersion(data[0].id);
        loadComments(data[0].id);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (versionId) => {
    try {
      const data = await commentService.getCommentsByVersion(versionId);
      setComments(prev => ({ ...prev, [versionId]: data }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      await documentService.uploadVersion(id, selectedFile, notes);
      setSelectedFile(null);
      setNotes('');
      loadVersions();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (versionId, fileName) => {
    try {
      await documentService.downloadAndSaveFile(versionId, fileName);
    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedVersion) return;

    try {
      await commentService.createComment({
        documentVersionId: selectedVersion,
        content: newComment
      });
      setNewComment('');
      loadComments(selectedVersion);
    } catch (error) {
      alert('Failed to add comment: ' + error.message);
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
      <div className="mb-3">
        <Link to="/documents" className="text-primary text-sm">← Back to Documents</Link>
      </div>

      <h1 className="mb-4">Document Details</h1>

      <div className="grid grid-2 gap-3">
        {/* Upload Section */}
        <div className="card">
          <h2 className="card-header">Upload New Version</h2>
          <form onSubmit={handleUpload}>
            <div className="input-group">
              <label className="input-label">Select File</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows="3"
                placeholder="Version notes..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
              {uploading ? <span className="loading"></span> : 'Upload'}
            </button>
          </form>
        </div>

        {/* Versions List */}
        <div className="card">
          <h2 className="card-header">Versions ({versions.length})</h2>
          {versions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-text">No versions yet</div>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {versions.map((version) => (
                <div
                  key={version.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    background: selectedVersion === version.id ? 'var(--bg-secondary)' : 'transparent'
                  }}
                >
                  <div className="flex-between mb-1">
                    <strong>Version {version.versionNo}</strong>
                    <span className="badge badge-primary">{(version.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="text-sm text-muted mb-2">{version.fileName}</div>
                  {version.notes && <div className="text-sm mb-2">{version.notes}</div>}
                  <div className="text-xs text-muted mb-2">
                    {new Date(version.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDownload(version.id, version.fileName)}
                      className="btn btn-secondary btn-sm"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVersion(version.id);
                        loadComments(version.id);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Comments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {selectedVersion && (
        <div className="card mt-3">
          <h2 className="card-header">
            Comments for Version {versions.find(v => v.id === selectedVersion)?.versionNo}
          </h2>

          <form onSubmit={handleAddComment} className="mb-3">
            <div className="input-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input"
                rows="2"
                placeholder="Add a comment..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Add Comment
            </button>
          </form>

          <div>
            {comments[selectedVersion]?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <div className="empty-state-text">No comments yet</div>
              </div>
            ) : (
              comments[selectedVersion]?.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div className="text-sm">{comment.content}</div>
                  <div className="text-xs text-muted mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetail;
