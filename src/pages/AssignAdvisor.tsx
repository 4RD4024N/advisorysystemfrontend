import React, { useState, useEffect } from 'react';
import { advisorService, studentService, authService } from '../services';

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
    <div className="max-w-full mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2"> Öğretmen Atama Yönetimi </h1>
        <p className="text-gray-600">Tüm öğrencileri görüntüleyin ve öğretmen ataması yapın</p>
      </div>

      {message.text && (
        <div className={`mb-6 px-6 py-4 rounded-xl animate-slideDown ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
          <p className="font-semibold">{message.type === 'success' ? '✓' : '×'} {message.text}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-2">Toplam Öğrenci</div>
          <div className="text-4xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-2">Öğretmeni Olan</div>
          <div className="text-4xl font-bold">{stats.assigned}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-2">Öğretmeni Olmayan</div>
          <div className="text-4xl font-bold">{stats.unassigned}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="text-sm opacity-90 mb-2">Toplam Öğretmen</div>
          <div className="text-4xl font-bold">{stats.totalAdvisors}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci ara (email, isim, öğretmen)..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${filterType === 'all'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterType('unassigned')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${filterType === 'unassigned'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Öğretmensizler
            </button>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg"
              disabled={loadingData}
            >
              {loadingData ? '⟳' : '↻'} Yenile
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {filteredStudents.length} öğrenci gösteriliyor
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">�️</p>
            <p className="text-gray-600 text-lg">Öğrenci bulunamadı</p>
            <p className="text-gray-400 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Öğrenci</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Email</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Belge Sayısı</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Durum</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Öğretmen</th>
                  <th className="text-right py-4 px-4 font-bold text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">{student.userName}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{student.email}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {student.documentCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {student.hasAdvisor ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          Atandı
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          Atanmadı
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {student.hasAdvisor && student.advisor ? (
                        <div>
                          <p className="font-medium text-gray-900">{student.advisor.userName}</p>
                          <p className="text-sm text-gray-500">{student.advisor.email}</p>
                        </div>
                      ) : (
                        <em className="text-gray-400">Atanmamış</em>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openAdvisorModal(student)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                          disabled={loading}
                        >
                          {student.hasAdvisor ? 'Değiştir' : 'Ata'}
                        </button>
                        {student.hasAdvisor && (
                          <button
                            onClick={() => handleRemoveAdvisor(student)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Öğretmen Seç</h3>
              <p className="text-gray-600">
                <span className="font-semibold">{selectedStudent?.userName}</span> için öğretmen seçin
              </p>
              {selectedStudent?.hasAdvisor && (
                <p className="text-sm text-yellow-600 mt-2">
                  Mevcut öğretmen değiştirilecek
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Öğretmen
              </label>
              <select
                value={selectedAdvisor}
                onChange={(e) => setSelectedAdvisor(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              >
                <option value="">Bir öğretmen seçin...</option>
                {advisors.map(advisor => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.userName} - {advisor.email}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {advisors.length} öğretmen mevcut
              </p>
            </div>

            {message.text && showModal && (
              <div className={`mb-4 px-4 py-3 rounded-lg ${message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                disabled={loading}
              >
                İptal
              </button>
              <button
                onClick={handleAssignAdvisor}
                disabled={loading || !selectedAdvisor}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Atanıyor...
                  </span>
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
