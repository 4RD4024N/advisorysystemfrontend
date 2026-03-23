import { useState, useEffect } from 'react';
import { authService, courseService } from '../services';
import { logger } from '../utils/logger';
import './Courses.css';

function Courses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Tüm dersleri backend'den al
      const response = await courseService.getAllCourses();
      
      const rawCourses = response.courses || response || [];
      const courses = rawCourses.map(course => ({
        code: course.courseCode || course.code,
        name: course.courseName || course.name,
        theory: course.theoryHours || course.theory || 0,
        practice: course.practiceHours || course.practice || 0,
        credit: course.credit || course.credits || 0,
        ects: course.ects || course.akts || 0,
        semester: course.semester || 1,
        type: course.isElective === true ? 'Seçmeli' : 'Zorunlu',
        description: course.description || course.Description || 'Bu ders için henüz açıklama eklenmemiş.',
        prerequisite: course.prerequisite,
        category: course.category?.name || 'Diğer'
      }));
      
      setAllCourses(courses);
    } catch (error) {
      logger.error('Dersler yüklenirken hata:', error as Error);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = searchTerm === '' || 
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = selectedSemester === 'all' || 
                           String(course.semester) === String(selectedSemester);
    
    const matchesType = selectedType === 'all' || 
                       course.type.toLowerCase() === selectedType.toLowerCase() ||
                       (selectedType.toLowerCase() === 'zorunlu' && course.type.toLowerCase().includes('zorunlu')) ||
                       (selectedType.toLowerCase() === 'se�meli' && (course.type.toLowerCase().includes('se�meli') || course.type.toLowerCase().includes('elective')));
    
    return matchesSearch && matchesSemester && matchesType;
  });

  const stats = {
    total: allCourses.length,
    required: allCourses.filter(c => c.type.toLowerCase().includes('zorunlu')).length,
    elective: allCourses.filter(c => c.type.toLowerCase().includes('seçmeli') || c.type.toLowerCase().includes('elective')).length,
    totalCredits: allCourses.reduce((sum, c) => sum + c.credit, 0)
  };

  return (
    <div className="courses-container">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Loading</div>
          <div style={{ fontSize: '1.25rem', color: '#666' }}>Dersler yükleniyor...</div>
        </div>
      ) : (
        <>
          <div className="courses-header">
            <div>
              <h1>Ders Kataloğu</h1>
              <p className="courses-subtitle">
                Bilgisayar Mühendisliği bölümü ders programı
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Toplam Ders</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Zorunlu</div>
                <div className="stat-value">{stats.required}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-label">Seçmeli</div>
                <div className="stat-value">{stats.elective}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎓</div>
              <div className="stat-info">
                <div className="stat-label">Toplam Kredi</div>
                <div className="stat-value">{stats.totalCredits}</div>
              </div>
            </div>
          </div>

          {/* Filtreler */}
          <div className="filters-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Ders kodu veya ismi ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tüm Yarıyıllar</option>
                <option value="1">1. Yarıyıl</option>
                <option value="2">2. Yarıyıl</option>
                <option value="3">3. Yarıyıl</option>
                <option value="4">4. Yarıyıl</option>
                <option value="5">5. Yarıyıl</option>
                <option value="6">6. Yarıyıl</option>
                <option value="7">7. Yarıyıl</option>
                <option value="8">8. Yarıyıl</option>
              </select>

              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tüm Ders Tipleri</option>
                <option value="zorunlu">Zorunlu</option>
                <option value="seçmeli">Seçmeli</option>
              </select>
            </div>
          </div>

          {/* Ders Listesi */}
          <div className="courses-grid">
            {filteredCourses.length === 0 ? (
              <div className="no-results">
                <div className="no-results-text">Aradığınız kriterlere uygun ders bulunamadı</div>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course.code} className="course-card">
                  <div className="course-header">
                    <div className="course-code">{course.code}</div>
                    <div className={`course-type ${course.type.toLowerCase().includes('zorunlu') ? 'zorunlu' : 'seçmeli'}`}>
                      {course.type}
                    </div>
                  </div>
                  
                  <h3 className="course-name">{course.name}</h3>
                  
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-details">
                    <div className="detail-item">
                      <span className="detail-label">Yarıyıl:</span>
                      <span className="detail-value">{course.semester}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Teorik:</span>
                      <span className="detail-value">{course.theory}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Uygulama:</span>
                      <span className="detail-value">{course.practice}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kredi:</span>
                      <span className="detail-value">{course.credit}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">AKTS:</span>
                      <span className="detail-value">{course.ects}</span>
                    </div>
                  </div>

                  {course.prerequisite && (
                    <div className="course-prerequisite">
                      <span className="prerequisite-icon">📌</span>
                      <span>Ön Koşul: {course.prerequisite}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Courses;