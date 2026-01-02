import React, { useState, useEffect } from 'react';
import { authService, courseService } from '../services';
import './CourseSchedule.css';

const CourseSchedule = () => {
  const [mySchedule, setMySchedule] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  // Günler (Türkçe)
  const dayNames = {
    'Monday': 'Pazartesi',
    'Tuesday': 'Salı',
    'Wednesday': 'Çarşamba',
    'Thursday': 'Perşembe',
    'Friday': 'Cuma'
  };
  
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  
  // Zaman dilimleri (08:00 - 18:00)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // İlk yüklemede programı ve dersleri getir
  useEffect(() => {
    loadMySchedule();
    loadAvailableCourses();
  }, [selectedSemester]);

  // Backend'den öğrencinin programını yükle
  const loadMySchedule = async () => {
    try {
      setLoading(true);
      const response = await courseService.getMySchedule(selectedSemester);
      setMySchedule(response);
      console.log('✅ Ders programı yüklendi:', response);
    } catch (error) {
      console.error('❌ Ders programı yüklenirken hata:', error);
      setMySchedule({ weeklySchedule: {}, courses: [], totalCourses: 0, totalCredits: 0, totalECTS: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Ders seçimi için mevcut dersleri yükle
  const loadAvailableCourses = async () => {
    try {
      console.log('🔄 Dersler yükleniyor... Yarıyıl:', selectedSemester);
      
      // Önce yeni course-selection endpoint'ini dene
      try {
        const response = await courseService.getAvailableCourses(selectedSemester);
        console.log('🔍 Backend Response (course-selection):', response);
        console.log('🔍 Courses Array:', response.courses);
        console.log('🔍 Courses Length:', response.courses?.length);
        
        if (response.courses && response.courses.length > 0) {
          setAvailableCourses(response.courses);
          console.log('✅ Seçilebilir dersler yüklendi (course-selection):', response.courses.length, 'ders');
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ /course-selection/available endpoint mevcut değil, fallback kullanılıyor:', apiError.response?.status);
      }
      
      // Fallback: /api/courses endpoint'ini kullan
      console.log('🔄 Fallback: /courses endpoint kullanılıyor...');
      const coursesResponse = await courseService.getAllCourses();
      const allCourses = coursesResponse.courses || coursesResponse || [];
      
      console.log('🔍 All Courses Response:', coursesResponse);
      console.log('🔍 All Courses Length:', allCourses.length);
      
      // Backend formatına uygun hale getir
      const formattedCourses = allCourses.map(course => ({
        courseId: course.id,
        courseCode: course.courseCode || course.code,
        courseName: course.courseName || course.name,
        description: course.description || 'Bu ders için henüz açıklama eklenmemiş.',
        credits: course.credits || course.credit || 0,
        ects: course.ects || 0,
        theoryHours: course.theoryHours || course.theory || 0,
        practiceHours: course.practiceHours || course.practice || 0,
        isElective: course.isElective === true,
        category: course.category || { name: 'Genel' },
        sectionCode: 'A', // Default section
        semester: course.semester || selectedSemester,
        instructor: 'Atanmadı',
        maxCapacity: 50,
        enrolledCount: 0,
        availableSeats: 50,
        isFull: false,
        isEnrolled: false,
        schedule: [] // Boş schedule - manuel ekleme gerekecek
      }));
      
      setAvailableCourses(formattedCourses);
      console.log('✅ Dersler fallback ile yüklendi:', formattedCourses.length, 'ders');
      
    } catch (error) {
      console.error('❌ Dersler yüklenirken hata:', error);
      console.error('❌ Error Response:', error.response?.data);
      setAvailableCourses([]);
    }
  };

  // Derse kayıt ol
  const handleEnrollCourse = async (course) => {
    if (course.isEnrolled) {
      alert('Bu derse zaten kayıtlısınız!');
      return;
    }

    if (course.isFull) {
      alert('Bu ders şubesi dolu!');
      return;
    }

    try {
      const result = await courseService.enrollCourse(
        course.courseId,
        course.sectionCode,
        course.semester
      );
      
      alert(`✅ ${result.courseCode} - ${result.courseName} dersine kayıt olundu!`);
      
      // Programı ve mevcut dersleri yeniden yükle
      await loadMySchedule();
      await loadAvailableCourses();
      
      setShowCourseModal(false);
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      
      // Hata mesajını göster
      if (error.response?.data?.conflictingCourse) {
        const conflict = error.response.data.conflictingCourse;
        alert(`❌ Zaman Çakışması!\n\n${conflict.courseCode} dersi ile ${conflict.day} günü ${conflict.time} saatinde çakışıyor.`);
      } else if (error.response?.data?.error) {
        alert(`❌ Hata: ${error.response.data.error}`);
      } else {
        alert('❌ Derse kayıt olurken bir hata oluştu.');
      }
    }
  };

  // Dersten çık
  const handleUnenrollCourse = async (course) => {
    if (!confirm(`${course.courseCode} - ${course.courseName} dersinden çıkmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await courseService.unenrollCourse(
        course.courseId,
        course.sectionCode,
        course.semester
      );
      
      alert(`✅ ${course.courseCode} dersinden çıkıldı.`);
      
      // Programı ve mevcut dersleri yeniden yükle
      await loadMySchedule();
      await loadAvailableCourses();
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
      alert(error.response?.data?.error || 'Dersten çıkarken bir hata oluştu.');
    }
  };

  // Belirli bir gün ve saatte hangi ders var
  const getCourseAtSlot = (day, time) => {
    if (!mySchedule?.weeklySchedule?.[day]) return null;
    
    return mySchedule.weeklySchedule[day].find(session => {
      return session.startTime <= time && time < session.endTime;
    });
  };

  // Ders rengi (courseCode'a göre)
  const getCourseColor = (courseCode) => {
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
        <div>
          <h1>Ders Programı</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Yarıyıl {selectedSemester} - {mySchedule?.totalCourses || 0} Ders
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="input"
            style={{ width: '150px' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Yarıyıl {sem}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setCourseSearchTerm('');
              setShowCourseModal(true);
            }}
            className="btn btn-primary"
          >
            + Ders Seç
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-4 gap-3 mb-4">
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Toplam Ders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {mySchedule?.totalCourses || 0}
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Toplam Kredi</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {mySchedule?.totalCredits || 0}
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Toplam ECTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {mySchedule?.totalECTS || 0}
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <div className="card-header" style={{ color: 'white', opacity: 0.9 }}>Haftalık Saat</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {mySchedule?.courses?.reduce((sum, course) => 
              sum + course.sessions.reduce((s, session) => s + (session.durationMinutes / 60), 0), 0
            ) || 0}
          </div>
        </div>
      </div>

      {/* Haftalık Program */}
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
                  <th key={day} style={{ 
                    padding: '1rem', 
                    borderBottom: '2px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center'
                  }}>
                    {day}
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
                    const session = getCourseAtSlot(day, time);
                    
                    return (
                      <td 
                        key={`${day}-${time}`}
                        style={{ 
                          padding: '0.5rem', 
                          borderBottom: '1px solid var(--border-color)',
                          borderRight: '1px solid var(--border-color)',
                          minHeight: '60px',
                          verticalAlign: 'top',
                          background: session ? getCourseColor(session.courseCode) : 'transparent',
                          color: session ? 'white' : 'inherit',
                          position: 'relative'
                        }}
                      >
                        {session && session.startTime === time && (
                          <div style={{ position: 'relative' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>
                              {session.courseCode}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.95, marginBottom: '4px' }}>
                              {session.courseName}
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                              {session.timeSlot}
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                              📍 {session.roomNumber} • {session.sessionType}
                            </div>
                          </div>
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

      {/* Kayıtlı Derslerim */}
      {mySchedule?.courses && mySchedule.courses.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Kayıtlı Derslerim</h2>
          <div style={{ marginTop: '1rem' }}>
            {mySchedule.courses.map(course => (
              <div key={`${course.courseId}-${course.sectionCode}`} style={{
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      {course.courseCode} - {course.courseName}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Şube: {course.sectionCode} | {course.credits} Kredi | {course.ects} ECTS
                    </div>
                    {course.description && (
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                        {course.description}
                      </p>
                    )}
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      {course.sessions.map((session, idx) => (
                        <div key={idx} style={{ 
                          padding: '0.5rem',
                          background: 'white',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          border: '1px solid #e0e0e0'
                        }}>
                          <strong>{session.dayName}:</strong> {session.timeSlot} | 
                          📍 {session.roomNumber} | 
                          {session.sessionType} | 
                          👨‍🏫 {session.instructorName}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnenrollCourse(course)}
                    className="btn btn-danger"
                    style={{ marginLeft: '1rem' }}
                  >
                    Dersten Çık
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ders Seçimi Modal */}
      {showCourseModal && (
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
          onClick={() => setShowCourseModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '85vh',
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
              borderBottom: '2px solid var(--border-color)',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 1
            }}>
              <h2 style={{ margin: 0 }}>Ders Seç - Yarıyıl {selectedSemester}</h2>
              <button
                onClick={() => setShowCourseModal(false)}
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
              {/* Arama */}
              <input
                type="text"
                placeholder="🔍 Ders kodu veya ismi ile ara..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="input"
                style={{ 
                  marginBottom: '1.5rem',
                  padding: '0.75rem',
                  fontSize: '1rem'
                }}
              />

              {/* Dersler */}
              <div>
                {availableCourses
                  .filter(course => {
                    if (!courseSearchTerm) return true;
                    const searchLower = courseSearchTerm.toLowerCase();
                    return course.courseCode.toLowerCase().includes(searchLower) ||
                           course.courseName.toLowerCase().includes(searchLower);
                  })
                  .map(course => (
                    <div
                      key={`${course.courseId}-${course.sectionCode}`}
                      style={{
                        padding: '1.25rem',
                        marginBottom: '1rem',
                        border: course.isEnrolled ? '2px solid #4caf50' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        background: course.isEnrolled ? '#e8f5e9' : course.isFull ? '#f5f5f5' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0 }}>
                              {course.courseCode} - {course.courseName}
                            </h3>
                            <span style={{
                              padding: '4px 12px',
                              background: course.isElective ? '#fff3e0' : '#e3f2fd',
                              color: course.isElective ? '#f57c00' : '#1976d2',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {course.isElective ? 'Seçmeli' : 'Zorunlu'}
                            </span>
                            {course.isEnrolled && (
                              <span style={{
                                padding: '4px 12px',
                                background: '#4caf50',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                ✓ Kayıtlı
                              </span>
                            )}
                          </div>
                          
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Şube: {course.sectionCode} | {course.credits} Kredi | {course.ects} ECTS | 
                            T:{course.theoryHours} U:{course.practiceHours}
                          </div>

                          {course.description && (
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                              {course.description}
                            </p>
                          )}

                          <div style={{ fontSize: '0.85rem', color: '#444', marginBottom: '0.75rem' }}>
                            👨‍🏫 {course.instructor}
                          </div>

                          {/* Schedule */}
                          <div style={{ 
                            background: course.schedule && course.schedule.length > 0 ? '#f5f5f5' : '#fff3e0', 
                            padding: '0.75rem', 
                            borderRadius: '8px',
                            marginBottom: '0.75rem',
                            border: course.schedule && course.schedule.length > 0 ? 'none' : '1px solid #ff9800'
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                              📅 Ders Saatleri:
                            </div>
                            {course.schedule && course.schedule.length > 0 ? (
                              course.schedule.map((session, idx) => (
                                <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.25rem', marginLeft: '1rem' }}>
                                  • <strong>{dayNames[session.dayOfWeek]}:</strong> {session.startTime} - {session.endTime} 
                                  | 📍 {session.roomNumber} 
                                  | {session.sessionType}
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: '0.85rem', color: '#f57c00', fontStyle: 'italic', marginLeft: '1rem' }}>
                                ⚠️ Bu ders için henüz program oluşturulmamış. Lütfen backend'de schedule generate edin.
                                <br />
                                <code style={{ fontSize: '0.75rem', background: '#fff', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                  POST /api/schedule/generate/{selectedSemester}
                                </code>
                              </div>
                            )}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: course.isFull ? '#f44336' : '#4caf50' }}>
                            👥 {course.enrolledCount}/{course.maxCapacity} - 
                            {course.isFull ? ' ⛔ Kapasite Dolu' : ` ✅ ${course.availableSeats} Boş Yer`}
                          </div>
                        </div>

                        <div style={{ marginLeft: '1rem' }}>
                          {course.isEnrolled ? (
                            <button
                              onClick={() => handleUnenrollCourse(course)}
                              className="btn btn-danger"
                            >
                              Dersten Çık
                            </button>
                          ) : course.isFull ? (
                            <button
                              className="btn btn-secondary"
                              disabled
                              style={{ cursor: 'not-allowed', opacity: 0.6 }}
                            >
                              Kapasite Dolu
                            </button>
                          ) : !course.schedule || course.schedule.length === 0 ? (
                            <button
                              className="btn btn-secondary"
                              disabled
                              style={{ cursor: 'not-allowed', opacity: 0.6 }}
                              title="Bu ders için henüz program oluşturulmamış"
                            >
                              ⚠️ Program Yok
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnrollCourse(course)}
                              className="btn btn-primary"
                            >
                              Kayıt Ol
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSchedule;
