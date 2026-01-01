import React, { useState, useEffect } from 'react';
import { authService, courseScheduleService } from '../services';
import './CourseSchedule.css';

const CourseSchedule = () => {
  const userInfo = authService.getUserInfo();
  const isAdvisor = authService.isAdvisor();
  const isAdmin = authService.isAdmin();
  
  const [schedule, setSchedule] = useState({});
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Zaman dilimleri (08:00 - 18:00 arası)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Günler
  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' }
  ];

  // Örnek ders listesi - Backend'den gelecek
  const courseList = [
    // Zorunlu Dersler
    { code: 'KRY100', name: 'KARİYER PLANLAMA', theory: 1, practice: 0, credit: 1, ects: 2, type: 'Zorunlu' },
    { code: 'ORY100', name: 'ÜNİVERSİTE HAYATINA GİRİŞ', theory: 1, practice: 0, credit: 1, ects: 1, type: 'Zorunlu' },
    
    // 1. Yarıyıl
    { code: 'BİL101', name: 'BİLGİSAYAR YAZILIMI I', theory: 3, practice: 1, credit: 3, ects: 5, semester: 1, type: 'Zorunlu' },
    { code: 'BİL105', name: 'PROGRAMLAMA LABORATUVARI I', theory: 0, practice: 2, credit: 1, ects: 2, semester: 1, type: 'Zorunlu' },
    { code: 'BİL110', name: 'BİLGİSAYAR MÜHENDİSLİĞİNE GİRİŞ', theory: 2, practice: 0, credit: 2, ects: 4, semester: 1, type: 'Zorunlu' },
    { code: 'ENG199', name: 'ADVANCED ENGLISH I', theory: 4, practice: 0, credit: 4, ects: 4, semester: 1, type: 'Zorunlu' },
    { code: 'FİZ103', name: 'MEKANİK LABORATUVARI', theory: 0, practice: 2, credit: 1, ects: 2, semester: 1, type: 'Zorunlu' },
    { code: 'FİZ105', name: 'GENEL FİZİK I', theory: 3, practice: 1, credit: 3, ects: 5, semester: 1, type: 'Zorunlu' },
    { code: 'MAT151', name: 'MATEMATİKSEL ANALİZ I', theory: 4, practice: 1, credit: 4, ects: 6, semester: 1, type: 'Zorunlu' },
    { code: 'TÜRK101', name: 'TÜRK DİLİ I', theory: 2, practice: 0, credit: 2, ects: 2, semester: 1, type: 'Zorunlu' },
    
    // 2. Yarıyıl
    { code: 'BİL122', name: 'İLERİ PROGRAMLAMA', theory: 3, practice: 1, credit: 3, ects: 5, semester: 2, prerequisite: 'BİL101', type: 'Zorunlu' },
    { code: 'BİL124', name: 'İLERİ PROGRAMLAMA UYGULAMALARI', theory: 0, practice: 2, credit: 1, ects: 2, semester: 2, prerequisite: 'BİL101', type: 'Zorunlu' },
    { code: 'BİL172', name: 'YAŞAM BİLİMLERİ VE BİLGİSAYAR MÜHENDİSLİĞİ', theory: 2, practice: 1, credit: 2, ects: 4, semester: 2, type: 'Zorunlu' },
    { code: 'FİZ104', name: 'ELEKTRİK LABORATUVARI', theory: 0, practice: 2, credit: 1, ects: 2, semester: 2, type: 'Zorunlu' },
    { code: 'FİZ110', name: 'GENEL FİZİK II', theory: 3, practice: 1, credit: 3, ects: 5, semester: 2, type: 'Zorunlu' },
    { code: 'MAT152', name: 'MATEMATİKSEL ANALİZ II', theory: 4, practice: 1, credit: 4, ects: 6, semester: 2, prerequisite: 'MAT151', type: 'Zorunlu' },
    { code: 'MAT210', name: 'DOĞRUSAL CEBİR', theory: 3, practice: 1, credit: 3, ects: 4, semester: 2, type: 'Zorunlu' },
    { code: 'TÜRK102', name: 'TÜRK DİLİ II', theory: 2, practice: 0, credit: 2, ects: 2, semester: 2, type: 'Zorunlu' },
    
    // Teknik Seçmeli Dersler
    { code: 'BİL321', name: 'HESAPLAMALI GRAFİK', theory: 3, practice: 0, credit: 3, ects: 5, type: 'Teknik Seçmeli' },
    { code: 'BİL328', name: 'OTOMATA TEORİSİ', theory: 3, practice: 0, credit: 3, ects: 5, type: 'Teknik Seçmeli' },
    { code: 'BİL345', name: 'SİSTEM MÜHENDİSLİĞİ', theory: 3, practice: 0, credit: 3, ects: 5, type: 'Teknik Seçmeli' },
    { code: 'BİL363', name: 'İNSAN BİLGİSAYAR ETKİLEŞİMİ', theory: 3, practice: 0, credit: 3, ects: 5, type: 'Teknik Seçmeli' },
    { code: 'BİL480', name: 'YAPAY ZEKA', theory: 3, practice: 0, credit: 3, ects: 5, type: 'Teknik Seçmeli' },
    { code: 'BİL477', name: 'VERİ MADENCİLİĞİNE GİRİŞ', theory: 3, practice: 0, credit: 3, ects: 5, type: 'Teknik Seçmeli' },
  ];

  useEffect(() => {
    loadSchedule();
    if (isAdvisor || isAdmin) {
      loadStudents();
    }
    setAvailableCourses(courseList);
    setLoading(false);
  }, []);

  const loadSchedule = async () => {
    // TODO: Backend'den ders programını yükle
    // Şimdilik örnek veri
    setSchedule({
      monday: {
        '09:00': { code: 'BİL101', name: 'BİLGİSAYAR YAZILIMI I', duration: 3 },
        '14:00': { code: 'MAT151', name: 'MATEMATİKSEL ANALİZ I', duration: 4 }
      },
      wednesday: {
        '10:00': { code: 'FİZ105', name: 'GENEL FİZİK I', duration: 3 }
      }
    });
  };

  const loadStudents = async () => {
    // TODO: Backend'den danışman öğrencilerini yükle
    setStudents([
      { id: 1, name: 'Ahmet Yılmaz', studentNo: '20210001' },
      { id: 2, name: 'Ayşe Demir', studentNo: '20210002' }
    ]);
  };

  const handleAddCourse = (day, time) => {
    setSelectedSlot({ day, time });
    setShowAddCourseModal(true);
  };

  const handleSaveCourse = () => {
    if (!selectedCourse || !selectedSlot) return;

    const newSchedule = { ...schedule };
    if (!newSchedule[selectedSlot.day]) {
      newSchedule[selectedSlot.day] = {};
    }
    
    newSchedule[selectedSlot.day][selectedSlot.time] = {
      ...selectedCourse,
      duration: selectedCourse.theory + selectedCourse.practice
    };

    setSchedule(newSchedule);
    setShowAddCourseModal(false);
    setSelectedCourse(null);
    setSelectedSlot(null);
    
    // TODO: Backend'e kaydet
  };

  const handleRemoveCourse = (day, time) => {
    if (!confirm('Bu dersi programdan kaldırmak istediğinize emin misiniz?')) return;

    const newSchedule = { ...schedule };
    if (newSchedule[day]) {
      delete newSchedule[day][time];
    }
    setSchedule(newSchedule);
    
    // TODO: Backend'den sil
  };

  const getCourseAtSlot = (day, time) => {
    return schedule[day]?.[time];
  };

  const getCourseColor = (courseCode) => {
    // Ders koduna göre renk ata
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    const hash = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h1>Ders Programı</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {(isAdvisor || isAdmin) && (
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="input"
              style={{ width: '250px' }}
            >
              <option value="">Kendi Programım</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.studentNo})
                </option>
              ))}
            </select>
          )}
          {!selectedStudent && (
            <button
              onClick={() => setShowAddCourseModal(true)}
              className="btn btn-primary"
            >
              + Ders Ekle
            </button>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-4 gap-3 mb-4">
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Toplam Ders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {Object.values(schedule).reduce((acc, day) => acc + Object.keys(day).length, 0)}
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Toplam Kredi</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {Object.values(schedule).reduce((acc, day) => {
              return acc + Object.values(day).reduce((sum, course) => sum + (course.credit || 0), 0);
            }, 0)}
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Toplam AKTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {Object.values(schedule).reduce((acc, day) => {
              return acc + Object.values(day).reduce((sum, course) => sum + (course.ects || 0), 0);
            }, 0)}
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Haftalık Saat</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {Object.values(schedule).reduce((acc, day) => {
              return acc + Object.values(day).reduce((sum, course) => sum + (course.duration || 0), 0);
            }, 0)}
          </div>
        </div>
      </div>

      {/* Haftalık Takvim */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ 
                  padding: '1rem', 
                  borderBottom: '2px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  position: 'sticky',
                  left: 0,
                  zIndex: 2
                }}>
                  Saat
                </th>
                {days.map(day => (
                  <th key={day.key} style={{ 
                    padding: '1rem', 
                    borderBottom: '2px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center'
                  }}>
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid var(--border-color)',
                    fontWeight: 'bold',
                    background: 'var(--bg-secondary)',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1
                  }}>
                    {time}
                  </td>
                  {days.map(day => {
                    const course = getCourseAtSlot(day.key, time);
                    return (
                      <td 
                        key={`${day.key}-${time}`}
                        style={{ 
                          padding: '0.5rem', 
                          borderBottom: '1px solid var(--border-color)',
                          borderRight: '1px solid var(--border-color)',
                          minHeight: '60px',
                          verticalAlign: 'top',
                          cursor: !selectedStudent ? 'pointer' : 'default',
                          background: course ? getCourseColor(course.code) : 'transparent',
                          color: course ? 'white' : 'inherit'
                        }}
                        onClick={() => !selectedStudent && !course && handleAddCourse(day.key, time)}
                      >
                        {course ? (
                          <div style={{ position: 'relative' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                              {course.code}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.95, marginBottom: '4px' }}>
                              {course.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                              {course.duration} saat
                            </div>
                            {!selectedStudent && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCourse(day.key, time);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: 'rgba(255,255,255,0.3)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : (
                          !selectedStudent && (
                            <div style={{ 
                              textAlign: 'center', 
                              color: 'var(--text-muted)',
                              fontSize: '0.8rem',
                              padding: '1rem 0'
                            }}>
                              +
                            </div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ders Ekleme Modal */}
      {showAddCourseModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddCourseModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
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
              <h2 style={{ margin: 0 }}>Ders Seç</h2>
              <button
                onClick={() => setShowAddCourseModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              <div className="input-group">
                <label className="input-label">Mevcut Dersler</label>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {availableCourses.map(course => (
                    <div
                      key={course.code}
                      onClick={() => setSelectedCourse(course)}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: selectedCourse?.code === course.code ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: selectedCourse?.code === course.code ? 'var(--primary-light)' : 'transparent'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {course.code} - {course.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        T: {course.theory} | U: {course.practice} | K: {course.credit} | AKTS: {course.ects}
                        {course.prerequisite && <span> | Önkoşul: {course.prerequisite}</span>}
                      </div>
                      {course.type && (
                        <div style={{ 
                          display: 'inline-block',
                          marginTop: '0.5rem',
                          padding: '2px 8px',
                          background: course.type === 'Zorunlu' ? '#e3f2fd' : '#fff3e0',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: course.type === 'Zorunlu' ? '#1976d2' : '#f57c00'
                        }}>
                          {course.type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={handleSaveCourse}
                  disabled={!selectedCourse}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Ekle
                </button>
                <button 
                  onClick={() => setShowAddCourseModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSchedule;
