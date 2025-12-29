import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentService, authService } from '../services';

const Documents = () => {
  const userInfo = authService.getUserInfo();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', tags: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    title: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, filters]);

  const loadDocuments = async () => {
    try {
      const data = await documentService.getMyDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading documents:', error);
      if (error.response?.status === 403) {
        setError('You can only access documents from students assigned to you');
      }
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Title filter
    if (filters.title.trim()) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    // Start date filter
    if (filters.startDate) {
      filtered = filtered.filter(doc => 
        new Date(doc.createdAt) >= new Date(filters.startDate)
      );
    }

    // End date filter
    if (filters.endDate) {
      filtered = filtered.filter(doc => 
        new Date(doc.createdAt) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      startDate: '',
      endDate: ''
    });
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

  const getRoleInfo = () => {
    if (!userInfo) return null;
    
    const role = userInfo.role;
    if (role === 'Admin') {
      return { text: 'Tüm Belgeler', icon: '👑', color: 'text-purple-600' };
    } else if (role === 'Advisor') {
      return { text: 'Danışmanı Olduğum Belgeler', icon: '👨‍🏫', color: 'text-blue-600' };
    } else {
      return { text: 'Belgelerim', icon: '📄', color: 'text-green-600' };
    }
  };

  const roleInfo = getRoleInfo();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Belgeler</h1>
          {roleInfo && (
            <p className={`text-sm font-medium ${roleInfo.color}`}>
              {roleInfo.icon} {roleInfo.text}
            </p>
          )}
        </div>
        {userInfo?.role === 'Student' && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>➕</span>
            <span>Yeni Belge</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🔍 Filtrele</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Başlık
            </label>
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleFilterChange}
              placeholder="Başlık ara..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bitiş Tarihi
            </label>
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
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-primary font-medium transition-colors"
            >
              ✕ Filtreleri Temizle
            </button>
            <span className="text-sm text-gray-500">
              {filteredDocuments.length} belge bulundu
            </span>
          </div>
        )}
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {filters.title || filters.startDate || filters.endDate ? 'Belge bulunamadı' : 'Henüz belge yok'}
            </div>
            <div className="text-gray-600 mb-6">
              {filters.title || filters.startDate || filters.endDate 
                ? 'Farklı filtreler deneyin' 
                : 'İlk belgenizi oluşturarak başlayın'}
            </div>
            {userInfo?.role === 'Student' && !filters.title && !filters.startDate && !filters.endDate && (
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <span>➕</span>
                <span>Belge Oluştur</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Link to={`/documents/${doc.id}`} className="block">
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary transition-colors line-clamp-2">
                  {doc.title}
                </h3>
              </Link>
              
              {doc.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags.split(',').slice(0, 3).map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📑</span>
                  <span>{doc.versionCount || 0} versiyon</span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>

              <Link 
                to={`/documents/${doc.id}`} 
                className="mt-4 w-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-xl hover:from-primary hover:to-primary-dark hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>👁️</span>
                <span>Detayları Gör</span>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 ">📄 Yeni Belge</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Belge Başlığı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Tez Taslağı"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Etiketler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="araştırma, tez, yazılım"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
