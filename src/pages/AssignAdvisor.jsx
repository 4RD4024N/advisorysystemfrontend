import React, { useState, useEffect } from 'react';
import { advisorService, documentService, authService } from '../services';

const AssignAdvisor = () => {
  const userInfo = authService.getUserInfo();
  const [documents, setDocuments] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [docsData, advisorsData] = await Promise.all([
        documentService.getAll(),
        advisorService.getAll()
      ]);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setAdvisors(Array.isArray(advisorsData) ? advisorsData : []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Veriler yüklenirken bir hata oluştu'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDocument || !selectedAdvisor) {
      setMessage({
        type: 'error',
        text: 'Lütfen belge ve danışman seçin'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await advisorService.assign({
        documentId: parseInt(selectedDocument),
        advisorUserId: selectedAdvisor
      });

      setMessage({
        type: 'success',
        text: 'Danışman başarıyla atandı'
      });
      
      setSelectedDocument('');
      setSelectedAdvisor('');
      
      // Reload documents to show updated advisor assignment
      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Danışman atanırken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo || userInfo.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
          <p className="font-semibold">⛔ Erişim Engellendi</p>
          <p className="text-sm mt-1">Bu sayfaya sadece adminler erişebilir</p>
        </div>
      </div>
    );
  }

  if (loadingData) {
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍🏫 Danışman Atama</h1>
        <p className="text-gray-600">Öğrenci belgelerine danışman atayın</p>
      </div>

      {message.text && (
        <div className={`mb-6 px-6 py-4 rounded-xl animate-slideDown ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-semibold">{message.type === 'success' ? '✅' : '❌'} {message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Belge Seç
            </label>
            <select
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              required
            >
              <option value="">Bir belge seçin...</option>
              {Array.isArray(documents) && documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title} 
                  {doc.advisorUserId && ' (Danışman atanmış)'}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              📄 Toplam {Array.isArray(documents) ? documents.length : 0} belge
            </p>
          </div>

          {/* Advisor Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Danışman Seç
            </label>
            <select
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              required
            >
              <option value="">Bir danışman seçin...</option>
              {Array.isArray(advisors) && advisors.map(advisor => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.userName || advisor.email}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              👨‍🏫 Toplam {Array.isArray(advisors) ? advisors.length : 0} danışman
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !selectedDocument || !selectedAdvisor}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Atanıyor...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Danışman Ata</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Current Assignments List */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Mevcut Atamalar</h2>
        
        {Array.isArray(documents) && documents.filter(doc => doc.advisorUserId).length > 0 ? (
          <div className="space-y-3">
            {documents.filter(doc => doc.advisorUserId).map(doc => {
              const advisor = Array.isArray(advisors) ? advisors.find(a => a.id === doc.advisorUserId) : null;
              return (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      👨‍🏫 Danışman: {advisor ? (advisor.userName || advisor.email) : 'Bilinmiyor'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Atanmış
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-gray-600">Henüz danışman atanmış belge yok</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignAdvisor;
