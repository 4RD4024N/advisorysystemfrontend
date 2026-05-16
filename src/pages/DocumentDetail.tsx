import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentService, commentService, ratingService, authService } from '../services';
import { validateFile } from '../utils/fileValidation';

const DocumentDetail = () => {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState({});
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingForm, setRatingForm] = useState({ score: '', comments: '' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const userInfo = authService.getUserInfo();
  const isAdvisorOrAdmin = authService.isAdvisor() || authService.isAdmin();

  useEffect(() => {
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadVersions = async () => {
    try {
      // Son 2 versiyonu göster
      const data = await documentService.getVersions(id);
      const limitedVersions = Array.isArray(data) ? data.slice(0, 2) : [];
      setVersions(limitedVersions);
      if (limitedVersions.length > 0) {
        setSelectedVersion(limitedVersions[0].id);
        loadComments(limitedVersions[0].id);
        if (isAdvisorOrAdmin) {
          loadRatings(limitedVersions[0].id);
        }
        loadMetadata(limitedVersions[0].id);
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

  const loadRatings = async (versionId) => {
    if (!isAdvisorOrAdmin) {
      return;
    }

    try {
      const data = await ratingService.getRatingsByVersion(versionId);
      setRatings(prev => ({ ...prev, [versionId]: data }));
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Error loading ratings:', error);
      }
    }
  };

  const loadMetadata = async (versionId) => {
    try {
      const data = await documentService.getMetadata(versionId);
      setMetadata(data);
      if (data.isPdf && data.canPreview) {
        setPreviewUrl(documentService.getPreviewUrl(versionId));
      } else {
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    try {
      await documentService.uploadVersion(id, selectedFile, notes);
      setSelectedFile(null);
      setNotes('');
      loadVersions();
    } catch (error) {
        alert('Yükleme başarısız: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (versionId, fileName) => {
    try {
      await documentService.downloadAndSaveFile(versionId, fileName);
    } catch (error) {
        alert('İndirme başarısız: ' + error.message);
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
        alert('Yorum eklenemedi: ' + error.message);
    }
  };

  const handleAddRating = async (e) => {
    e.preventDefault();
    if (!selectedVersion || !ratingForm.score) return;

    try {
      await ratingService.createOrUpdateRating({
        documentVersionId: selectedVersion,
        score: parseInt(ratingForm.score),
        comments: ratingForm.comments
      });
      setShowRatingModal(false);
      setRatingForm({ score: '', comments: '' });
      loadRatings(selectedVersion);
      alert('Değlendirme başarıyla gönderildi!');
    } catch (error) {
      alert('Değlendirme gönderilemedi: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!confirm('Bu değlendirmeyi silmek istediğinizden emin misiniz?')) return;

    try {
      await ratingService.deleteRating(ratingId);
      loadRatings(selectedVersion);
      alert('Değlendirme başarıyla silindi!');
    } catch (error) {
      alert('Değlendirme silinemedi: ' + error.message);
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
        <Link to="/documents" className="text-primary text-sm">← Belgelere Geri Dön</Link>
      </div>

      <h1 className="mb-4">Belge Detayları</h1>

      <div className="grid grid-2 gap-3">
        {/* Upload Section */}
        <div className="card">
          <h2 className="card-header">Yeni Versiyon Yükle</h2>
          <form onSubmit={handleUpload}>
            <div className="input-group">
              <label className="input-label">Dosya Seç</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Notlar</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows="3"
                placeholder="Versiyon notları..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
              {uploading ? <span className="loading"></span> : 'Yükle'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-header">Versiyonlar ({versions.length})</h2>
          {versions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">Yorum yok</div>
              <div className="empty-state-text">Henüz versiyon yok</div>
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
                    <strong>Versiyon {version.versionNo}</strong>
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
                      İndir
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVersion(version.id);
                        loadComments(version.id);
                        if (isAdvisorOrAdmin) {
                          loadRatings(version.id);
                        }
                        loadMetadata(version.id);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Detayları Gör
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
        <div className="grid grid-2 gap-3 mt-3">
          {/* PDF Preview Section */}
          {previewUrl && metadata?.isPdf && (
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h2 className="card-header">Belge Önizleme</h2>
              <div style={{ height: '600px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Document Preview"
                />
              </div>
            </div>
          )}

          {isAdvisorOrAdmin && (
            <div className="card">
              <div className="flex-between mb-3">
                <h2 className="card-header" style={{ marginBottom: 0 }}>
                  Versiyon {versions.find(v => v.id === selectedVersion)?.versionNo} Değlendirmeleri
                </h2>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  Belgeyi Değlendir
                </button>
              </div>

              {ratings[selectedVersion]?.hasRating ? (
                <div>
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    color: 'white',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
                      {ratings[selectedVersion].averageScore.toFixed(1)} / 100
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
                      Ortalama Puan ({ratings[selectedVersion].ratingCount} değlendirme)
                    </div>
                  </div>

                  <div>
                    {ratings[selectedVersion].ratings?.map((rating) => (
                      <div
                        key={rating.id}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          border: '2px solid var(--border-color)'
                        }}
                      >
                        <div className="flex-between mb-2">
                          <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: rating.score >= 80 ? '#84fab0' : rating.score >= 60 ? '#ffd3a5' : '#fd6585',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            {rating.score} / 100
                          </div>
                          {(authService.isAdmin() || rating.advisorUserId === userInfo?.sub) && (
                            <button
                              onClick={() => handleDeleteRating(rating.id)}
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Sil
                            </button>
                          )}
                        </div>
                        {rating.comments && (
                          <div className="text-sm" style={{ marginTop: '8px', lineHeight: '1.5' }}>
                            {rating.comments}
                          </div>
                        )}
                        <div className="text-xs text-muted mt-2">
                          {new Date(rating.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">⭐</div>
                  <div className="empty-state-text">Henüz değlendirme yok</div>
                </div>
              )}
            </div>
          )}


          <div className="card">
            <h2 className="card-header">
              Versiyon {versions.find(v => v.id === selectedVersion)?.versionNo} Yorumları
            </h2>

            <form onSubmit={handleAddComment} className="mb-3">
              <div className="input-group">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input"
                  rows="2"
                  placeholder="Yorum ekle..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Yorum Ekle
              </button>
            </form>

            <div>
              {comments[selectedVersion]?.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <div className="empty-state-text">Henüz yorum yok</div>
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
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowRatingModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: '2px solid var(--border-color)'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Belgeyi Değlendir</h2>
              <button
                onClick={() => setShowRatingModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  padding: 0,
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddRating} style={{ padding: '2rem' }}>
              <div className="input-group">
                <label className="input-label">Puan (1-100) *</label>
                <input
                  type="number"
                  value={ratingForm.score}
                  onChange={(e) => setRatingForm({ ...ratingForm, score: e.target.value })}
                  className="input"
                  min="1"
                  max="100"
                  placeholder="örn. 85"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Yorumlar</label>
                <textarea
                  value={ratingForm.comments}
                  onChange={(e) => setRatingForm({ ...ratingForm, comments: e.target.value })}
                  className="input"
                  rows="4"
                  placeholder="Belge hakkında geri bildirim yazın..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Değlendirmeyi Gönder
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetail;
