import { useState, useEffect } from 'react';
import { advisorService, studentService, authService } from '../services';
import './AssignAdvisor.css';

const AssignAdvisor = () => {
  const userInfo = authService.getUserInfo();
  const [students, setStudents] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' or 'unassigned'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
    totalAdvisors: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [studentsData, advisorsData] = await Promise.all([
        studentService.getAllStudents({ pageSize: 1000 }),
        advisorService.getAllAdvisors()
      ]);

      const studentsList = Array.isArray(studentsData?.students) ? studentsData.students : [];
      setStudents(studentsList);

      const advisorsList = Array.isArray(advisorsData?.advisors) ? advisorsData.advisors : [];
      setAdvisors(advisorsList);

      const assigned = studentsList.filter(s => s.hasAdvisor).length;
      const unassigned = studentsList.filter(s => !s.hasAdvisor).length;
      setStats({
        total: studentsList.length,
        assigned: assigned,
        unassigned: unassigned,
        totalAdvisors: advisorsData?.totalAdvisors || advisorsList.length
      });

      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Veriler yüklenirken bir hata oluştu'
      });
    } finally {
      setLoadingData(false);
    }
  };

  const openAdvisorModal = (student) => {
    setSelectedStudent(student);
    setSelectedAdvisor(student.hasAdvisor && student.advisor ? student.advisor.id : '');
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setSelectedAdvisor('');
  };

  const handleAssignAdvisor = async () => {
    if (!selectedAdvisor) {
      setMessage({
        type: 'error',
        text: 'Lütfen bir öğretmen seçin'
      });
      return;
    }

    try {
      setLoading(true);

      // Danışman atama işlemini yap
      const result = await advisorService.assignAdvisorToStudent(
        selectedStudent.id,
        selectedAdvisor
      );

      setMessage({
        type: 'success',
        text: result.message || (result.isUpdate ? 'Öğretmen başarıyla güncellendi' : 'Öğretmen başarıyla atandı')
      });

      closeModal();

      // Reload data to reflect changes
      setTimeout(() => {
        loadData();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Öğretmen atanırken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdvisor = async (student) => {
    if (!confirm(`${student.userName} öğrencisinin öğretmen atamasını kaldırmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const result = await advisorService.removeAdvisorFromStudent(student.id);

      setMessage({
        type: 'success',
        text: result.message || 'Öğretmen ataması kaldırıldı'
      });

      // Reload data
      setTimeout(() => {
        loadData();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Öğretmen ataması kaldırılırken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    if (filterType === 'unassigned' && student.hasAdvisor) {
      return false;
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.userName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query) ||
      (student.hasAdvisor && student.advisor?.userName?.toLowerCase().includes(query))
    );
  });

  if (!userInfo || userInfo.role !== 'Admin') {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="alert alert-error">
          <p><strong>⛔ Erişim Engellendi</strong></p>
          <p>Bu sayfaya sadece adminler erişebilir</p>
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
    <div className="assign-advisor-page">
      <div className="assign-advisor-header">
        <div>
          <h1>Öğretmen Atama Yönetimi</h1>
          <p>Tüm öğrencileri görüntüleyin ve öğretmen ataması yapın</p>
        </div>
      </div>

      {message.text && !showModal && (
        <div className={`alert mb-3 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? '✓' : '×'} {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-card-label">Toplam Öğrenci</div>
          <div className="stat-card-value">{stats.total}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-label">Öğretmeni Olan</div>
          <div className="stat-card-value">{stats.assigned}</div>
        </div>
        <div className="stat-card stat-card-yellow">
          <div className="stat-card-label">Öğretmeni Olmayan</div>
          <div className="stat-card-value">{stats.unassigned}</div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-card-label">Toplam Öğretmen</div>
          <div className="stat-card-value">{stats.totalAdvisors}</div>
        </div>
      </div>

      <div className="card">
        {/* Search and Filter Bar */}
        <div className="filter-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci ara (email, isim, öğretmen)..."
            className="input"
          />
          <div className="filter-buttons">
            <button
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'filter-btn-active-primary' : 'filter-btn-inactive'}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterType('unassigned')}
              className={filterType === 'unassigned' ? 'filter-btn-active-yellow' : 'filter-btn-inactive'}
            >
              Öğretmensizler
            </button>
            <button
              onClick={loadData}
              className="btn btn-success"
              disabled={loadingData}
            >
              {loadingData ? '⟳' : '↻'} Yenile
            </button>
          </div>
        </div>

        <div className="results-count">{filteredStudents.length} öğrenci gösteriliyor</div>

        {loadingData ? (
          <div className="flex-center" style={{ padding: '3rem' }}>
            <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px', borderColor: 'rgba(102,126,234,0.3)', borderTopColor: '#667eea' }}></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-table">
            <div className="empty-table-icon">🔍</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Öğrenci bulunamadı</p>
            <p className="text-sm text-muted">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        ) : (
          <div className="advisor-table-wrap">
            <table className="advisor-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Öğrenci</th>
                  <th style={{ textAlign: 'left' }}>Email</th>
                  <th style={{ textAlign: 'center' }}>Belge Sayısı</th>
                  <th style={{ textAlign: 'center' }}>Durum</th>
                  <th style={{ textAlign: 'left' }}>Öğretmen</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td><p className="student-name">{student.userName}</p></td>
                    <td className="student-email">{student.email}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="doc-count-badge">{student.documentCount || 0}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {student.hasAdvisor ? (
                        <span className="status-badge-assigned">Atandı</span>
                      ) : (
                        <span className="status-badge-unassigned">Atanmadı</span>
                      )}
                    </td>
                    <td>
                      {student.hasAdvisor && student.advisor ? (
                        <div>
                          <p className="advisor-name">{student.advisor.userName}</p>
                          <p className="advisor-email-small">{student.advisor.email}</p>
                        </div>
                      ) : (
                        <em className="not-assigned-em">Atanmamış</em>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => openAdvisorModal(student)}
                          className="btn btn-primary btn-sm"
                          disabled={loading}
                        >
                          {student.hasAdvisor ? 'Değiştir' : 'Ata'}
                        </button>
                        {student.hasAdvisor && (
                          <button
                            onClick={() => handleRemoveAdvisor(student)}
                            className="btn btn-danger btn-sm"
                            disabled={loading}
                          >
                            Kaldır
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Öğretmen Seç</h3>
            <p className="modal-subtitle">
              <strong>{selectedStudent?.userName}</strong> için öğretmen seçin
              {selectedStudent?.hasAdvisor && (
                <span className="modal-warning"><br />Mevcut öğretmen değiştirilecek</span>
              )}
            </p>

            <div className="input-group">
              <label className="input-label">Öğretmen</label>
              <select
                value={selectedAdvisor}
                onChange={(e) => setSelectedAdvisor(e.target.value)}
                className="input"
              >
                <option value="">Bir öğretmen seçin...</option>
                {advisors.map(advisor => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.userName} - {advisor.email}
                  </option>
                ))}
              </select>
              <p className="form-hint">{advisors.length} öğretmen mevcut</p>
            </div>

            {message.text && showModal && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {message.text}
              </div>
            )}

            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-secondary" disabled={loading}>
                İptal
              </button>
              <button
                onClick={handleAssignAdvisor}
                disabled={loading || !selectedAdvisor}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <div className="loading"></div>
                    Atanıyor...
                  </>
                ) : (
                  selectedStudent?.hasAdvisor ? 'Güncelle' : 'Ata'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignAdvisor;
