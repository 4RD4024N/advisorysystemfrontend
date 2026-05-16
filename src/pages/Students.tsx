import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { studentService, authService } from '../services';
import './Students.css';

type StudentFilter = 'all' | 'without-advisor' | 'pending';
type UserRole = string | string[] | null;

interface AdvisorInfo {
  userName: string;
}

interface StudentItem {
  id: string;
  fullName: string;
  email: string;
  registrationNo?: string;
  department?: string;
  createdAt: string;
  pendingSubmissions?: number;
  hasAdvisor?: boolean;
  advisor?: AdvisorInfo;
}

interface NotificationPayload {
  title: string;
  message: string;
}

interface BulkNotificationResponse {
  successCount: number;
  failedCount: number;
  errors?: string[];
}

interface StudentsResult {
  students?: StudentItem[];
}

function Students() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StudentFilter>('all'); // 'all', 'without-advisor', 'pending'
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notificationData, setNotificationData] = useState<NotificationPayload>({ title: '', message: '' });
  const [userRole, setUserRole] = useState<UserRole>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      let data: StudentItem[] | StudentsResult;

      if (filter === 'without-advisor') {
        data = await studentService.getStudentsWithoutAdvisor();
        setStudents(Array.isArray(data) ? data : []);
      } else if (filter === 'pending') {
        data = await studentService.getStudentsWithPendingSubmissions();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        data = await studentService.getAllStudents();
        setStudents(Array.isArray((data as StudentsResult).students) ? (data as StudentsResult).students as StudentItem[] : []);
      }
    } catch (error: unknown) {
      console.error('Failed to load students:', error);
      if (isAxiosError(error) && error.response?.status === 403) {
        alert('Sadece size atanmış öğrencilere erişebilirsiniz');
      }
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const userInfo = authService.getUserInfo();
    setUserRole(userInfo?.role ?? null);
    loadStudents();
  }, [loadStudents]);

  const handleSendNotification = async (studentId: string) => {
    if (!notificationData.title || !notificationData.message) {
      alert('Lütfen başlık ve mesaj girin');
      return;
    }

    try {
      await studentService.sendNotification(studentId, notificationData);
      alert('Bildirim başarıyla gönderildi!');
      setShowNotificationModal(false);
      setNotificationData({ title: '', message: '' });
    } catch (error: unknown) {
      console.error('Failed to send notification:', error);
      if (isAxiosError(error) && error.response?.status === 403) {
        alert('Sadece size atanmış öğrencilere bildirim gönderebilirsiniz');
      } else {
        alert('Bildirim gönderilemedi');
      }
    }
  };

  const handleSendBulkNotification = async () => {
    if (selectedStudents.length === 0) {
      alert('Lütfen en az bir öğrenci seçin');
      return;
    }

    if (!notificationData.title || !notificationData.message) {
      alert('Lütfen başlık ve mesaj girin');
      return;
    }

    try {
      const response = await studentService.sendBulkNotification({
        studentIds: selectedStudents,
        ...notificationData
      }) as BulkNotificationResponse;

      if (response.errors && response.errors.length > 0) {
        alert(`${response.successCount} öğrenciye gönderildi. Başarısız: ${response.failedCount}\n${response.errors.join('\n')}`);
      } else {
        alert(`Bildirim ${selectedStudents.length} öğrenciye gönderildi!`);
      }

      setShowBulkModal(false);
      setSelectedStudents([]);
      setNotificationData({ title: '', message: '' });
    } catch (error: unknown) {
      console.error('Failed to send bulk notification:', error);
      if (isAxiosError(error) && error.response?.status === 403) {
        alert('Sadece size atanmış öğrencilere bildirim gönderebilirsiniz');
      } else {
        alert('Bildirimler gönderilemedi');
      }
    }
  };

  const handleSendToAll = async () => {
    if (!notificationData.title || !notificationData.message) {
      alert('Lütfen başlık ve mesaj girin');
      return;
    }

    if (!confirm('TÜM öğrencilere bildirim gönderilsin mi?')) {
      return;
    }

    try {
      await studentService.sendNotificationToAll(notificationData);
      alert('Tüm öğrencilere bildirim gönderildi!');
      setShowBulkModal(false);
      setNotificationData({ title: '', message: '' });
    } catch (error: unknown) {
      console.error('Failed to send notification to all:', error);
      alert('Bildirimler gönderilemedi');
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getStatusBadge = (student: StudentItem) => {
    if (filter === 'without-advisor') {
      return <span className="badge badge-warning">Danışmanı Yok</span>;
    }
    if (filter === 'pending' && (student.pendingSubmissions ?? 0) > 0) {
      return <span className="badge badge-danger">{student.pendingSubmissions} Bekleyen</span>;
    }
    return <span className="badge badge-success">Aktif</span>;
  };

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <h1>Öğrenci Yönetimi</h1>
          <p>Öğrencileri, danışmanları ve bildirimleri yönetin</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowBulkModal(true)}
        >
          📨 Bildirim Yolla
        </button>
      </div>

      <div className="students-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {userRole === 'Admin' ? 'Tüm Öğrenciler' : 'Öğrencilerim'}
        </button>
        {userRole === 'Admin' && (
          <button
            className={`filter-btn ${filter === 'without-advisor' ? 'active' : ''}`}
            onClick={() => setFilter('without-advisor')}
          >
            Danışmanı Olmayan
          </button>
        )}
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Bekleyen Gönderimler
        </button>
      </div>

      {loading ? (
        <div className="loading">Öğrenciler yükleniyor...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍🎓</div>
          <h3>Öğrenci bulunamadı</h3>
          <p>
            {filter === 'without-advisor'
              ? 'Tüm öğrencilere danışman atanmış'
              : filter === 'pending'
                ? 'Bekleyen görevi olan öğrenci yok'
                : 'Sistemde öğrenci bulunamadı'}
          </p>
        </div>
      ) : (
        <>
          {selectedStudents.length > 0 && (
            <div className="selection-toolbar">
              <span>{selectedStudents.length} öğrenci seçildi</span>
              <button
                className="btn-secondary"
                onClick={() => setShowBulkModal(true)}
              >
                Seçilenlere Bildirim Yolla
              </button>
              <button
                className="btn-text"
                onClick={() => setSelectedStudents([])}
              >
                Seçimi Temizle
              </button>
            </div>
          )}

          <div className="students-list">
            {Array.isArray(students) && students.length > 0 ? students.map(student => (
              <div key={student.id} className="student-card">
                <div className="student-card-header">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudentSelection(student.id)}
                    className="student-checkbox"
                  />
                  <div className="student-info">
                    <h3>{student.fullName}</h3>
                    <p className="student-email">{student.email}</p>
                  </div>
                  {getStatusBadge(student)}
                </div>

                <div className="student-details">
                  <div className="detail-item">
                    <span className="detail-label">Kayıt No:</span>
                    <span className="detail-value">{student.registrationNo || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bölüm:</span>
                    <span className="detail-value">{student.department || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Oluşturulma Tarihi:</span>
                    <span className="detail-value">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* ✨ NEW v2.1: Display advisor information */}
                  <div className="detail-item">
                    <span className="detail-label">👨‍🏫 Danışman:</span>
                    {student.hasAdvisor && student.advisor ? (
                      <span className="detail-value" style={{ color: '#10b981', fontWeight: '600' }}>
                        {student.advisor.userName}
                      </span>
                    ) : (
                      <span className="detail-value" style={{ color: '#f59e0b' }}>
                        Atanmamış
                      </span>
                    )}
                  </div>
                </div>

                <div className="student-actions">
                  <button
                    className="btn-action"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowNotificationModal(true);
                    }}
                  >
                    📨 Bildirim yolla
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <div className="empty-icon">Öğrenci yok</div>
                <p>Öğrenci bulunamadı</p>
              </div>
            )}
          </div>
        </>
      )}


      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bildirim Yolla</h2>
              <button
                className="modal-close"
                onClick={() => setShowNotificationModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">
                Alıcı: {selectedStudent?.fullName}
              </p>

              <div className="form-group">
                <label>Başlık</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={e => setNotificationData({ ...notificationData, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>

              <div className="form-group">
                <label>Metin</label>
                <textarea
                  value={notificationData.message}
                  onChange={e => setNotificationData({ ...notificationData, message: e.target.value })}
                  placeholder="Notification message"
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowNotificationModal(false)}
              >
                İptal
              </button>
              <button
                className="btn-primary"
                onClick={() => selectedStudent && handleSendNotification(selectedStudent.id)}
                disabled={!selectedStudent}
              >
                Bildirim Yolla
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Toplu Bildirim Gönder</h2>
              <button
                className="modal-close"
                onClick={() => setShowBulkModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">
                {selectedStudents.length > 0
                  ? `Alıcı: ${selectedStudents.length} seçili öğrenci`
                  : 'Alıcı: Tüm öğrenciler'}
              </p>

              <div className="form-group">
                <label>Başlık</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={e => setNotificationData({ ...notificationData, title: e.target.value })}
                  placeholder="Bildirim başlığı"
                />
              </div>

              <div className="form-group">
                <label>Mesaj</label>
                <textarea
                  value={notificationData.message}
                  onChange={e => setNotificationData({ ...notificationData, message: e.target.value })}
                  placeholder="Bildirim mesajı"
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowBulkModal(false)}
              >
                İptal
              </button>
              {selectedStudents.length > 0 ? (
                <button
                  className="btn-primary"
                  onClick={handleSendBulkNotification}
                >
                  Seçilenlere Gönder ({selectedStudents.length})
                </button>
              ) : userRole === 'Admin' ? (
                <button
                  className="btn-danger"
                  onClick={handleSendToAll}
                >
                  Tüm Öğrencilere Gönder
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleSendBulkNotification}
                  disabled
                >
                  Gönderim için öğrenci seçin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
