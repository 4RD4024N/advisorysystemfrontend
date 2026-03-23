import { useState, useEffect, useCallback } from 'react';
import { authService, courseService, studentService } from '../services';
import { logger } from '../utils/logger';
import './CourseSchedule.css';

interface Session {
  dayName: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  instructorName: string;
  sessionType: string;
  isTheory: boolean;
  durationMinutes?: number;
  timeSlot?: string;
  dayOfWeek?: string;
}

interface Course {
  id?: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  code?: string;
  name?: string;
  description: string;
  credits: number;
  ects: number;
  theoryHours: number;
  practiceHours: number;
  isElective: boolean;
  category: { name?: string } | string;
  sectionCode: string;
  semester: number;
  instructor: string;
  maxCapacity: number;
  enrolledCount: number;
  availableSeats: number;
  isFull: boolean;
  isEnrolled: boolean;
  schedule: Session[];
  sessions?: Session[];
}

interface ScheduleEntry {
  courseCode: string;
  courseName: string;
  courseId: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  instructorName: string;
  sessionType: string;
  isTheory: boolean;
  credits: number;
  ects: number;
}

interface WeeklySchedule {
  [key: string]: ScheduleEntry[];
}

interface ScheduleData {
  weeklySchedule: WeeklySchedule;
  courses: Course[];
  totalCourses: number;
  totalCredits: number;
  totalECTS: number;
}

interface Student {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
  fullName?: string;
  registrationNo?: string;
}

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

const CourseSchedule = () => {
  const [mySchedule, setMySchedule] = useState<ScheduleData | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  // Advisor için öğrenci seçimi
  const [userRole, setUserRole] = useState<string | string[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const dayNames: Record<string, string> = {
    'Monday': 'Pazartesi',
    'Tuesday': 'Salı',
    'Wednesday': 'Çarşamba',
    'Thursday': 'Perşembe',
    'Friday': 'Cuma'
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Gün ismini normalize et - Türkçe/İngilizce karakter uyumsuzluğunu çözer
  const normalizeDayName = useCallback((dayName: string | undefined): string | null => {
    if (!dayName) return null;

    // Küçük harfe çevir ve boşlukları temizle
    const normalized = dayName.toLowerCase().trim();

    // Tüm olası gün ismi varyasyonlarını maple
    const dayMappings: Record<string, string> = {
      // İngilizce
      'monday': 'Pazartesi',
      'tuesday': 'Salı',
      'wednesday': 'Çarşamba',
      'thursday': 'Perşembe',
      'friday': 'Cuma',
      'saturday': 'Cumartesi',
      'sunday': 'Pazar',

      // Türkçe - doğru karakterler
      'pazartesi': 'Pazartesi',
      'salı': 'Salı',
      'çarşamba': 'Çarşamba',
      'perşembe': 'Perşembe',
      'cuma': 'Cuma',
      'cumartesi': 'Cumartesi',
      'pazar': 'Pazar',

      // Türkçe - ASCII karakterler (backend'den böyle gelebilir)
      'sali': 'Salı',
      'carsamba': 'Çarşamba',
      'persembe': 'Perşembe',

      // Türkçe - büyük i sorunları
      'salİ': 'Salı',
      'çarŞamba': 'Çarşamba',
      'perŞembe': 'Perşembe',

      // Kısaltmalar
      'mon': 'Pazartesi',
      'tue': 'Salı',
      'wed': 'Çarşamba',
      'thu': 'Perşembe',
      'fri': 'Cuma',
      'sat': 'Cumartesi',
      'sun': 'Pazar',

      // Sayısal değerler (0=Pazar, 1=Pazartesi, ...)
      '0': 'Pazar',
      '1': 'Pazartesi',
      '2': 'Salı',
      '3': 'Çarşamba',
      '4': 'Perşembe',
      '5': 'Cuma',
      '6': 'Cumartesi'
    };

    // Direkt eşleşme
    if (dayMappings[normalized]) {
      return dayMappings[normalized];
    }

    // Zaten doğru formatta mı kontrol et
    if (DAYS.includes(dayName)) {
      return dayName;
    }

    // Partial match dene (örn: "Salı" içinde "sal" var mı)
    for (const [key, value] of Object.entries(dayMappings)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return value;
      }
    }

    logger.warn('Bilinmeyen gün ismi', { dayName });
    return dayName; // Eşleşme bulunamazsa orijinali döndür
  }, []);

  // Advisor için öğrencileri yükle
  const loadMyStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyStudents();
      const studentList = data.students || data || [];
      logger.debug('Öğrenci listesi:', studentList);
      setStudents(Array.isArray(studentList) ? studentList : []);
    } catch (error) {
      logger.error('Öğrenciler yüklenirken hata:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Advisor: seçilen öğrencinin programını yükle
  const loadStudentSchedule = async (studentId: string) => {
    try {
      setLoading(true);
      // courseService.getStudentSchedule kullan (doğru endpoint)
      const response = await courseService.getStudentSchedule(studentId);

      logger.debug('Öğrenci programı yanıtı:', response);

      // Haftalık programı oluştur
      const weeklySchedule: WeeklySchedule = {
        'Pazartesi': [],
        'Salı': [],
        'Çarşamba': [],
        'Perşembe': [],
        'Cuma': []
      };

      response.courses?.forEach((course: Course) => {
        course.sessions?.forEach((session: Session) => {
          // Gün ismini normalize et
          const normalizedDay = normalizeDayName(session.dayName);
          logger.debug(`Gün mapping: "${session.dayName}" → "${normalizedDay}"`);

          const scheduleEntry: ScheduleEntry = {
            courseCode: course.courseCode,
            courseName: course.courseName,
            courseId: course.courseId,
            startTime: session.startTime,
            endTime: session.endTime,
            roomNumber: session.roomNumber,
            instructorName: session.instructorName,
            sessionType: session.sessionType,
            isTheory: session.isTheory,
            credits: course.credits,
            ects: course.ects
          };

          if (normalizedDay && weeklySchedule[normalizedDay]) {
            weeklySchedule[normalizedDay].push(scheduleEntry);
          } else {
            logger.warn(`Gün bulunamadı: "${session.dayName}" → "${normalizedDay}"`);
          }
        });
      });

      logger.debug('Haftalık program:', weeklySchedule);

      const updatedResponse: ScheduleData = {
        ...response,
        weeklySchedule: weeklySchedule
      };

      setMySchedule(updatedResponse || {
        weeklySchedule: {},
        courses: [],
        totalCourses: 0,
        totalCredits: 0,
        totalECTS: 0
      });

    } catch (error) {
      logger.error('Ders programı yüklenirken hata:', error);
      setMySchedule({
        weeklySchedule: {},
        courses: [],
        totalCourses: 0,
        totalCredits: 0,
        totalECTS: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    // studentId string (GUID) olarak kalmalı, parseInt yapmıyoruz
    const id = studentId || null;
    setSelectedStudentId(id);
    // students listesinde id veya userId
    const student = students.find(s => s.id === id || s.userId === id);
    setSelectedStudent(student || null);

    if (id) {
      // Backend için doğru id'yi kullan (userId varsa onu, yoksa id)
      const backendId = student?.userId || id;
      loadStudentSchedule(backendId);
    } else {
      setMySchedule(null);
    }
  };

  const loadMySchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getMySchedule();

      // Haftalık programı oluştur
      const weeklySchedule: WeeklySchedule = {
        'Pazartesi': [],
        'Salı': [],
        'Çarşamba': [],
        'Perşembe': [],
        'Cuma': []
      };

      response.courses?.forEach((course: Course) => {
        course.sessions?.forEach((session: Session) => {
          // Gün ismini normalize et
          const normalizedDay = normalizeDayName(session.dayName);
          logger.debug(`Gün mapping: "${session.dayName}" → "${normalizedDay}"`);

          const scheduleEntry: ScheduleEntry = {
            courseCode: course.courseCode,
            courseName: course.courseName,
            courseId: course.courseId,
            startTime: session.startTime,
            endTime: session.endTime,
            roomNumber: session.roomNumber,
            instructorName: session.instructorName,
            sessionType: session.sessionType,
            isTheory: session.isTheory,
            credits: course.credits,
            ects: course.ects
          };

          if (normalizedDay && weeklySchedule[normalizedDay]) {
            weeklySchedule[normalizedDay].push(scheduleEntry);
          } else {
            logger.warn(`Gün bulunamadı: "${session.dayName}" → "${normalizedDay}"`);
          }
        });
      });

      logger.debug('Haftalık program:', weeklySchedule);

      const updatedResponse: ScheduleData = {
        ...response,
        weeklySchedule: weeklySchedule
      };

      setMySchedule(updatedResponse || {
        weeklySchedule: {},
        courses: [],
        totalCourses: 0,
        totalCredits: 0,
        totalECTS: 0
      });

    } catch (error) {
      logger.error('Ders programı yüklenirken hata:', error);

      setMySchedule({
        weeklySchedule: {},
        courses: [],
        totalCourses: 0,
        totalCredits: 0,
        totalECTS: 0
      });
    } finally {
      logger.debug('loadMySchedule BİTTİ');
      setLoading(false);
    }
  }, [normalizeDayName]);


  const loadAvailableCourses = useCallback(async () => {
    try {
      logger.debug('Tüm dersler yükleniyor (zorunlu + seçmeli)...');

      let allCourses: Course[] = [];
      let availableCoursesData: Course[] = [];

      // 1. Önce course-selection/available endpoint'ini dene (schedule bilgisiyle gelir)
      try {
        const availableResponse = await courseService.getAvailableCourses();
        availableCoursesData = availableResponse.courses || availableResponse || [];
        logger.debug('course-selection/available', { count: availableCoursesData.length });
      } catch (apiError) {
        logger.warn('course-selection/available endpoint başarısız', { error: apiError });
      }

      // 2. Tüm dersleri /courses endpoint'inden al
      try {
        const allCoursesResponse = await courseService.getAllCourses();
        const rawCourses = allCoursesResponse.courses || allCoursesResponse || [];
        logger.debug('/courses endpoint', { count: rawCourses.length });

        // Tüm dersleri formatla
        allCourses = rawCourses.map((course: Course) => {
          // Eğer availableCoursesData'da bu ders varsa, oradan schedule bilgisini al
          const availableCourse = availableCoursesData.find(
            ac => ac.courseId === course.id || ac.courseCode === (course.courseCode || course.code)
          );

          return {
            courseId: course.id || course.courseId,
            courseCode: course.courseCode || course.code || '',
            courseName: course.courseName || course.name || '',
            description: course.description || '',
            credits: course.credits || 0,
            ects: course.ects || 0,
            theoryHours: course.theoryHours || 0,
            practiceHours: course.practiceHours || 0,
            isElective: course.isElective === true,
            category: typeof course.category === 'string' ? course.category : (course.category?.name || 'Genel'),
            sectionCode: availableCourse?.sectionCode || course.sectionCode || 'A',
            semester: course.semester || 1,
            instructor: availableCourse?.instructor || course.instructor || 'Atanmadı',
            maxCapacity: availableCourse?.maxCapacity || course.maxCapacity || 50,
            enrolledCount: availableCourse?.enrolledCount || course.enrolledCount || 0,
            availableSeats: availableCourse?.availableSeats || course.availableSeats || 50,
            isFull: availableCourse?.isFull || false,
            isEnrolled: availableCourse?.isEnrolled || false,
            schedule: availableCourse?.schedule || course.schedule || course.sessions || []
          };
        });
      } catch (coursesError) {
        logger.warn('/courses endpoint başarısız', { error: coursesError });

        // Fallback: Eğer /courses da başarısız olursa, availableCoursesData'yı kullan
        if (availableCoursesData.length > 0) {
          allCourses = availableCoursesData;
        }
      }

      // 3. Eğer hiç ders yoksa ve availableCoursesData varsa onu kullan
      if (allCourses.length === 0 && availableCoursesData.length > 0) {
        allCourses = availableCoursesData;
      }

      // 4. Dersleri sırala: Önce zorunlu, sonra seçmeli, alfabetik
      allCourses.sort((a, b) => {
        // Önce zorunlu/seçmeli sıralaması
        if (a.isElective !== b.isElective) {
          return a.isElective ? 1 : -1; // Zorunlu dersler önce
        }
        // Sonra ders koduna göre alfabetik
        return (a.courseCode || '').localeCompare(b.courseCode || '');
      });

      logger.debug('Toplam yüklenen ders', { count: allCourses.length });
      logger.debug('Zorunlu dersler', { count: allCourses.filter(c => !c.isElective).length });
      logger.debug('Seçmeli dersler', { count: allCourses.filter(c => c.isElective).length });

      setAvailableCourses(allCourses);

    } catch (error) {
      logger.error('Dersler yüklenirken hata:', error);
      setAvailableCourses([]);
    }
  }, []);


  useEffect(() => {
    const userInfo = authService.getUserInfo();
    setUserRole(userInfo?.role || null);

    if (userInfo?.role === 'Advisor') {
      // Advisor: once ogrencileri yukle
      loadMyStudents();
    } else {
      // Student: kendi programini yukle
      void loadMySchedule();
      void loadAvailableCourses();
    }
  }, [loadAvailableCourses, loadMySchedule]);

  const handleEnrollCourse = async (course: Course) => {
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

      alert(`${result.courseCode} - ${result.courseName} dersine kayıt olundu!`);


      await loadMySchedule();
      await loadAvailableCourses();

      setShowCourseModal(false);
    } catch (error: unknown) {
      logger.error('Kayıt hatası:', error);

      const axiosError = error as { response?: { data?: { error?: string; message?: string; conflictDetails?: Array<{ courseCode: string; day: string; existingTime: string }> } } };
      const errorData = axiosError.response?.data;

      if (errorData?.conflictDetails) {
        // Çakışma detaylarını göster
        const conflicts = errorData.conflictDetails
          .map(c => `• ${c.courseCode}: ${c.day} ${c.existingTime}`)
          .join('\n');

        alert(`${errorData.error}\n\n${errorData.message}\n\nÇakışan Dersler:\n${conflicts}`);
      } else if (errorData?.message) {
        alert(`${errorData.error}\n\n${errorData.message}`);
      } else if (errorData?.error) {
        alert(`${errorData.error}`);
      } else {
        alert('Derse kayıt olurken bir hata oluştu.');
      }
    }
  };


  const handleUnenrollCourse = async (course: ScheduleEntry | Course) => {
    if (!confirm(`${course.courseCode} - ${course.courseName} dersinden çıkmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await courseService.unenrollCourse(course.courseId);

      alert(`${course.courseCode} dersinden çıkıldı.`);


      await loadMySchedule();
      await loadAvailableCourses();
    } catch (error: unknown) {
      logger.error('Çıkış hatası:', error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || 'Dersten çıkarken bir hata oluştu.');
    }
  };


  const getCourseAtSlot = (day: string, time: string): ScheduleEntry | null => {
    if (!mySchedule?.weeklySchedule?.[day]) {
      return null;
    }


    const session = mySchedule.weeklySchedule[day].find((session: ScheduleEntry) => {
      return session.startTime === time;
    });

    return session || null;
  };

  const getCourseColor = (courseCode: string): string => {
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


  if (userRole === 'Advisor' && !selectedStudentId) {
    return (
      <div>
        <div className="flex-between mb-4">
          <div>
            <h1>Ders Programı</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Danışmanı olduğunuz öğrencilerin ders programlarını görüntüleyin
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="input"
              style={{
                minWidth: '280px',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '2px solid var(--primary-color)',
                background: 'var(--bg-primary)'
              }}
            >
              <option value="">-- Öğrenci Seçin --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.registrationNo || student.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍🎓</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Öğrenci Seçin
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Ders programını görüntülemek için yukarıdaki listeden bir öğrenci seçin
          </p>
          {students.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              Henüz size atanmış öğrenci bulunmuyor.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Ders Programı</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {userRole === 'Advisor' && selectedStudent ? `${selectedStudent.email} - ` : ''}
            {mySchedule?.totalCourses || 0} Ders
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Advisor için öğrenci seçimi */}
          {userRole === 'Advisor' && (
            <select
              value={selectedStudentId || ''}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="input"
              style={{
                minWidth: '280px',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '2px solid var(--primary-color)',
                background: 'var(--bg-primary)'
              }}
            >
              <option value="">-- Öğrenci Seçin --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.registrationNo || student.email})
                </option>
              ))}
            </select>
          )}


          {userRole === 'Student' && (
            <button
              onClick={() => {
                setCourseSearchTerm('');
                setShowCourseModal(true);
              }}
              className="btn btn-primary"
            >
              + Ders Seç
            </button>
          )}
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
              sum + (course.sessions?.reduce((s, session) => s + ((session.durationMinutes || 60) / 60), 0) || 0), 0
            ) || 0}
          </div>
        </div>
      </div>

      {/* Haftalık Program */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{
                  padding: '1rem',
                  borderBottom: '2px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  width: '80px'
                }}>
                  Saat
                </th>
                {DAYS.map(day => (
                  <th key={day} style={{
                    padding: '1rem',
                    borderBottom: '2px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center',
                    width: '18%'
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
                  {DAYS.map(day => {
                    const session = getCourseAtSlot(day, time);

                    return (
                      <td
                        key={`${day}-${time}`}
                        style={{
                          padding: '0.5rem',
                          borderBottom: '1px solid var(--border-color)',
                          borderRight: '1px solid var(--border-color)',
                          minHeight: '60px',
                          height: '70px',
                          width: '18%',
                          maxWidth: '180px',
                          verticalAlign: 'top',
                          background: session ? getCourseColor(session.courseCode) : 'transparent',
                          color: session ? 'white' : 'inherit',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {session && session.startTime === time && (
                          <div style={{
                            position: 'relative',
                            overflow: 'hidden',
                            maxHeight: '100%'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              marginBottom: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {session.courseCode}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              opacity: 0.95,
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.2'
                            }} title={session.courseName}>
                              {session.courseName}
                            </div>
                            <div style={{
                              fontSize: '0.65rem',
                              opacity: 0.9,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              📍 {session.roomNumber}
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

      {/* Kayıtlı Dersler */}
      {mySchedule?.courses && mySchedule.courses.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>{userRole === 'Advisor' && selectedStudent ? `${selectedStudent.email} - Kayıtlı Dersler` : 'Kayıtlı Derslerim'}</h2>
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
                      {(course.sessions || []).map((session, idx) => (
                        <div key={idx} style={{
                          padding: '0.5rem',
                          background: 'white',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          border: '1px solid #e0e0e0'
                        }}>                          <strong>{session.dayName}:</strong> {session.startTime} - {session.endTime} |
                          {session.roomNumber} |
                          {session.sessionType} |
                          {session.instructorName}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Sadece öğrenci dersten çıkabilir */}
                  {userRole === 'Student' && (
                    <button
                      onClick={() => handleUnenrollCourse(course)}
                      className="btn btn-danger"
                      style={{ marginLeft: '1rem' }}
                    >
                      Dersten Çık
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ders yoksa mesaj göster (Advisor için) */}
      {userRole === 'Advisor' && selectedStudentId && (!mySchedule?.courses || mySchedule.courses.length === 0) && (
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Kayıtlı Ders Yok
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {selectedStudent?.fullName} henüz ders kaydı yapmamış.
          </p>
        </div>
      )}

      {/* Ders Seçimi Modal - Sadece öğrenci için */}
      {showCourseModal && userRole === 'Student' && (
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
              <h2 style={{ margin: 0 }}>Ders Seç</h2>
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
                            Instructor: {course.instructor}
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
                              Ders Saatleri:
                            </div>
                            {course.schedule && course.schedule.length > 0 ? (
                              course.schedule.map((session: Session, idx: number) => (
                                <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.25rem', marginLeft: '1rem' }}>
                                  • <strong>{session.dayOfWeek ? dayNames[session.dayOfWeek] || session.dayName : session.dayName}:</strong> {session.startTime} - {session.endTime}
                                  | {session.roomNumber}
                                  | {session.sessionType}
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: '0.85rem', color: '#f57c00', fontStyle: 'italic', marginLeft: '1rem' }}>
                                Bu ders için henüz program oluşturulmamış. Lütfen backend&apos;de schedule generate edin.
                                <br />
                                <code style={{ fontSize: '0.75rem', background: '#fff', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                                  POST /api/schedule/generate/{'{semester}'}
                                </code>
                              </div>
                            )}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: course.isFull ? '#f44336' : '#4caf50' }}>
                            {course.enrolledCount}/{course.maxCapacity} -
                            {course.isFull ? ' Kapasite Dolu' : ` ${course.availableSeats} Boş Yer`}
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
