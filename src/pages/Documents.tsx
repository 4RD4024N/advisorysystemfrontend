import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { documentService, authService } from '../services';

interface DocumentItem {
  id: string;
  title: string;
  tags?: string;
  createdAt: string;
  versionCount?: number;
}

interface DocumentFilters {
  title: string;
  startDate: string;
  endDate: string;
}

interface CreateDocumentForm {
  title: string;
  tags: string;
}

const Documents = () => {
  const userInfo = authService.getUserInfo();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateDocumentForm>({ title: '', tags: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<DocumentFilters>({
    title: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...documents];

    if (filters.title.trim()) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(doc =>
        new Date(doc.createdAt) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(doc =>
        new Date(doc.createdAt) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadDocuments = async () => {
    try {
      // Backend'den dökümanları getir
      const data = await documentService.getMyDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      console.error('Error loading documents:', error);
      if (isAxiosError(error) && error.response?.status === 403) {
        setError('Sadece size atanmış öğrencilerin belgelerine erişebilirsiniz');
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value } as DocumentFilters));
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleCreateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await documentService.createDocument(formData);
      setShowCreateModal(false);
      setFormData({ title: '', tags: '' });
      loadDocuments();
    } catch (err: unknown) {
      const fallbackMessage = 'Belge oluşturma başarısız';
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(typeof message === 'string' ? message : fallbackMessage);
      } else {
        setError(fallbackMessage);
      }
    } finally {
      setCreating(false);
    }
  };

  const getRoleInfo = () => {
    if (!userInfo) return null;

    const role = userInfo.role;
    if (role === 'Admin') {
      return { text: 'Tüm Belgeler', icon: '👑', color: 'text-purple-600' };
    } else if (role === 'Advisor') {
      return { text: 'Danışmanı Olduğum Belgeler', icon: '👨‍🏫', color: 'text-blue-600' };
    } else {
      return { text: 'Belgelerim', icon: '', color: 'text-green-600' };
    }
  };

  const roleInfo = getRoleInfo();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex-between mb-4">
        <div>
          <h1>Belgeler</h1>
          {roleInfo && (
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
              {roleInfo.icon} {roleInfo.text}
            </p>
          )}
        </div>
        {userInfo?.role === 'Student' && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + Yeni Belge
          </button>
        )}
      </div>

      {/* Filtreler */}
      <div className="card mb-4">
        <h2 className="card-header">Filtrele</h2>
        <div className="grid grid-3 gap-3">
          <div className="input-group">
            <label className="input-label">Başlık</label>
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleFilterChange}
              placeholder="Başlık ara..."
              className="input"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Başlangıç Tarihi</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Bitiş Tarihi</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
        </div>
        {(filters.title || filters.startDate || filters.endDate) && (
          <div className="flex-between mt-3">
            <button
              onClick={clearFilters}
              className="btn btn-secondary btn-sm"
            >
              ✕ Filtreleri Temizle
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {filteredDocuments.length} belge bulundu
            </span>
          </div>
        )}
      </div>

      {/* Belge Listesi */}
      {filteredDocuments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-text">
              {filters.title || filters.startDate || filters.endDate
                ? 'Belge bulunamadı'
                : 'Henüz belge yok'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {filters.title || filters.startDate || filters.endDate
                ? 'Farklı filtreler deneyin'
                : 'İlk belgenizi oluşturarak başlayın'}
            </div>
            {userInfo?.role === 'Student' && !filters.title && !filters.startDate && !filters.endDate && (
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                + Belge Oluştur
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-3 gap-3">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <Link to={`/documents/${doc.id}`}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {doc.title}
                </h3>
              </Link>

              {doc.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {doc.tags.split(',').slice(0, 3).map((tag, i) => (
                    <span key={i} className="badge badge-primary">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-between mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>📑</span>
                  <span>{doc.versionCount || 0} versiyon</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <Link to={`/documents/${doc.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                Detayları Gör
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Belge Oluştur Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px',
              maxWidth: '480px', width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.5rem 2rem', borderBottom: '2px solid var(--border-color)'
            }}>
              <h2 style={{ margin: 0 }}>Yeni Belge</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              {error && (
                <div className="alert alert-error mb-3" style={{
                  padding: '0.75rem 1rem', background: '#fef2f2',
                  border: '1px solid #fecaca', borderRadius: '8px',
                  color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem'
                }}>
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleCreateDocument}>
                <div className="input-group">
                  <label className="input-label">Belge Başlığı</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Örn: Tez Taslağı"
                    required
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Etiketler (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="araştırma, tez, yazılım"
                    className="input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {creating ? <span className="loading"></span> : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
