import { useState, useEffect } from 'react';
import { submissionService, documentService, authService } from '../services';
import './CreateSubmission.css';

const CreateSubmission = () => {
  const userInfo = authService.getUserInfo();
  const [_students, _setStudents] = useState([]);
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
      const docsData = await documentService.getMyDocuments();
      setDocuments(Array.isArray(docsData) ? docsData : []);
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

    // Tarih geçmişte olamaz
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
        text: 'Teslim talebi başarıyla oluşturuldu! Öğrenciye bildirim gönderildi.'
      });

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
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="alert alert-error">
          <p><strong>⛔ Erişim Engellendi</strong></p>
          <p>Bu sayfaya sadece danışmanlar ve adminler erişebilir</p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }}></div>
      </div>
    );
  }

  return (
    <div className="create-submission-page">
      <div className="create-submission-header">
        <div>
          <h1>Teslim Talebi Oluştur</h1>
          <p>Öğrenciye tarih belirterek belge teslimi talep edin</p>
        </div>
      </div>

      {message.text && (
        <div className={`alert mb-3 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Student Selection */}
          <div className="input-group">
            <label className="input-label">
              Öğrenci E-postası <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              placeholder="ornek@ogrenci.edu.tr"
              required
              className="input"
            />
            <p className="form-hint">📧 Öğrencinin e-posta adresini girin</p>
          </div>

          {/* Document Selection (Optional) */}
          <div className="input-group">
            <label className="input-label">Belge (İsteğe Bağlı)</label>
            <select
              name="documentId"
              value={formData.documentId}
              onChange={handleChange}
              className="input"
            >
              <option value="">Belge seçilmedi</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
            <p className="form-hint">📄 İsteğe bağlı: Belirli bir belge için talep oluşturabilirsiniz</p>
          </div>

          {/* Due Date */}
          <div className="input-group">
            <label className="input-label">
              Teslim Tarihi <span style={{ color: 'var(--danger-color)' }}>*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={getMinDate()}
              required
              className="input"
            />
            {daysUntil !== null && (
              <p className={`date-hint ${daysUntil < 0 ? 'past' : daysUntil < 7 ? 'soon' : 'upcoming'}`}>
                {daysUntil > 0 ? `${daysUntil} gün sonra` : daysUntil === 0 ? 'Bugün' : 'Geçmiş tarih seçilemez'}
              </p>
            )}
            <p className="form-hint">🔔 Teslim tarihinden 3 gün önce otomatik hatırlatma gönderilir</p>
          </div>

          {/* Notes */}
          <div className="input-group">
            <label className="input-label">Notlar</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Ek açıklamalar veya talimatlar yazın..."
              className="input"
              style={{ resize: 'none' }}
            />
            <p className="form-hint">Öğrenciye gönderilecek ek bilgiler</p>
          </div>

          {/* Submit Button */}
          <hr className="form-divider" />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary submit-btn"
          >
            {loading ? (
              <>
                <div className="loading"></div>
                <span>Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Teslim Talebi Oluştur</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <h3>ℹ️ Bilgilendirme</h3>
        <ul>
          <li>Öğrenciye anında bildirim gönderilir</li>
          <li>Teslim tarihinden 3 gün önce otomatik hatırlatma yapılır</li>
          <li>Öğrenci, teslim durumunu sisteme işaretleyebilir</li>
          <li>Danışmanlar sadece kendi öğrencileri için talep oluşturabilir</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateSubmission;
