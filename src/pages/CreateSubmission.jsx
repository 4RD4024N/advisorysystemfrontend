import React, { useState, useEffect } from 'react';
import { submissionService, documentService, authService } from '../services';

const CreateSubmission = () => {
  const userInfo = authService.getUserInfo();
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    studentEmail: '',
    documentId: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      // Load documents
      const docsData = await documentService.getMyDocuments();
      setDocuments(Array.isArray(docsData) ? docsData : []);
      
      // TODO: Load students list from students service
      // const studentsData = await studentsService.getAll();
      // setStudents(studentsData);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Veriler yüklenirken bir hata oluştu: ' + error.message
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentEmail || !formData.dueDate) {
      setMessage({
        type: 'error',
        text: 'Lütfen öğrenci e-postası ve teslim tarihi seçin'
      });
      return;
    }

    // Validate date is in future
    const selectedDate = new Date(formData.dueDate);
    const now = new Date();
    if (selectedDate <= now) {
      setMessage({
        type: 'error',
        text: 'Teslim tarihi gelecekte olmalıdır'
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await submissionService.createSubmission({
        studentEmail: formData.studentEmail,
        documentId: formData.documentId ? parseInt(formData.documentId) : null,
        dueDate: new Date(formData.dueDate).toISOString(),
        notes: formData.notes
      });

      setMessage({
        type: 'success',
        text: '✅ Teslim talebi başarıyla oluşturuldu! Öğrenciye bildirim gönderildi.'
      });
      
      // Reset form
      setFormData({
        studentEmail: '',
        documentId: '',
        dueDate: '',
        notes: ''
      });
    } catch (error) {
      if (error.response?.status === 403) {
        setMessage({
          type: 'error',
          text: '⛔ Bu öğrenci size atanmamış. Sadece kendi öğrencileriniz için teslim talebi oluşturabilirsiniz.'
        });
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Teslim talebi oluşturulurken bir hata oluştu'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!formData.dueDate) return null;
    const deadline = new Date(formData.dueDate);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilDeadline();

  if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'Advisor')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
          <p className="font-semibold">⛔ Erişim Engellendi</p>
          <p className="text-sm mt-1">Bu sayfaya sadece danışmanlar ve adminler erişebilir</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Teslim Talebi Oluştur</h1>
        <p className="text-gray-600">Öğrenciye tarih belirterek belge teslimi talep edin</p>
      </div>

      {message.text && (
        <div className={`mb-6 px-6 py-4 rounded-xl animate-slideDown ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-semibold">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Öğrenci E-postası <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              placeholder="ornek@ogrenci.edu.tr"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              📧 Öğrencinin e-posta adresini girin
            </p>
          </div>

          {/* Document Selection (Optional) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Belge (İsteğe Bağlı)
            </label>
            <select
              name="documentId"
              value={formData.documentId}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            >
              <option value="">Belge seçilmedi</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              📄 İsteğe bağlı: Belirli bir belge için talep oluşturabilirsiniz
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Teslim Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={getMinDate()}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
            {daysUntil !== null && (
              <div className={`mt-2 text-sm font-medium ${
                daysUntil < 7 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {daysUntil > 0 ? (
                  <>⏰ {daysUntil} gün sonra</>
                ) : daysUntil === 0 ? (
                  <>⚠️ Bugün</>
                ) : (
                  <>❌ Geçmiş tarih seçilemez</>
                )}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              🔔 Teslim tarihinden 3 gün önce otomatik hatırlatma gönderilir
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Ek açıklamalar veya talimatlar yazın..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              📝 Öğrenciye gönderilecek ek bilgiler
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Teslim Talebi Oluştur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>ℹ️</span>
          <span>Bilgilendirme</span>
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Öğrenciye anında bildirim gönderilir</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Teslim tarihinden 3 gün önce otomatik hatırlatma yapılır</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Öğrenci, teslim durumunu sisteme işaretleyebilir</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Danışmanlar sadece kendi öğrencileri için talep oluşturabilir</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CreateSubmission;
