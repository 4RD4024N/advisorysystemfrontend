import { useState, useEffect } from 'react';
import { courseService, authService } from '../services';
import './Courses.css';

function Courses() {
  const [requirements, setRequirements] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-courses'); // 'my-courses' or 'requirements'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userInfo = authService.getUserInfo();
  const isAdmin = authService.isAdmin();

  // Form states
  const [courseForm, setCourseForm] = useState({
    courseRequirementId: '',
    isCompleted: false,
    grade: '',
    completionDate: ''
  });

  const [requirementForm, setRequirementForm] = useState({
    courseName: '',
    courseCode: '',
    credits: '',
    isRequired: true,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, myCoursesData] = await Promise.all([
        courseService.getAllRequirements(),
        courseService.getMyCourses()
      ]);
      setRequirements(Array.isArray(reqData) ? reqData : []);
      setMyCourses(Array.isArray(myCoursesData) ? myCoursesData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const dataToSend = {
        courseRequirementId: parseInt(courseForm.courseRequirementId),
        isCompleted: courseForm.isCompleted,
        grade: courseForm.grade ? parseFloat(courseForm.grade) : null,
        completionDate: courseForm.completionDate || null
      };

      await courseService.addMyCourse(dataToSend);
      setMessage({ type: 'success', text: 'Course added successfully!' });
      setShowAddModal(false);
      resetCourseForm();
      loadData();
    } catch (error) {
      console.error('Failed to add course:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add course' 
      });
    }
  };

  const handleUpdateCourse = async (courseId) => {
    try {
      const course = myCourses.find(c => c.id === courseId);
      if (!course) return;

      const updateData = {
        isCompleted: !course.isCompleted,
        grade: course.grade,
        completionDate: course.isCompleted ? null : new Date().toISOString()
      };

      await courseService.updateCourseCompletion(courseId, updateData);
      setMessage({ type: 'success', text: 'Course updated successfully!' });
      loadData();
    } catch (error) {
      console.error('Failed to update course:', error);
      setMessage({ type: 'error', text: 'Failed to update course' });
    }
  };

  const handleAddRequirement = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const dataToSend = {
        ...requirementForm,
        credits: parseInt(requirementForm.credits)
      };

      await courseService.addRequirement(dataToSend);
      setMessage({ type: 'success', text: 'Requirement added successfully!' });
      setShowRequirementModal(false);
      resetRequirementForm();
      loadData();
    } catch (error) {
      console.error('Failed to add requirement:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add requirement' 
      });
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      courseRequirementId: '',
      isCompleted: false,
      grade: '',
      completionDate: ''
    });
  };

  const resetRequirementForm = () => {
    setRequirementForm({
      courseName: '',
      courseCode: '',
      credits: '',
      isRequired: true,
      description: ''
    });
  };

  const getAvailableRequirements = () => {
    const addedRequirementIds = myCourses.map(c => c.courseRequirementId);
    return requirements.filter(r => !addedRequirementIds.includes(r.id));
  };

  const getCompletionStats = () => {
    const completed = myCourses.filter(c => c.isCompleted).length;
    const total = myCourses.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalCredits = myCourses
      .filter(c => c.isCompleted)
      .reduce((sum, c) => sum + (c.credits || 0), 0);
    
    return { completed, total, percentage, totalCredits };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <div>
          <h1>Course Management</h1>
          <p className="courses-subtitle">Track your course progress and requirements</p>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button 
              className="btn-add-requirement" 
              onClick={() => setShowRequirementModal(true)}
            >
              + Add Requirement
            </button>
          )}
          <button 
            className="btn-add-course" 
            onClick={() => setShowAddModal(true)}
            disabled={getAvailableRequirements().length === 0}
          >
            + Add My Course
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed} / {stats.total}</div>
            <div className="stat-label">Courses Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.percentage}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCredits}</div>
            <div className="stat-label">Total Credits</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'my-courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-courses')}
        >
          My Courses
        </button>
        <button 
          className={`tab ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          All Requirements
        </button>
      </div>

      {activeTab === 'my-courses' ? (
        <div className="courses-list">
          {myCourses.length > 0 ? (
            myCourses.map(course => (
              <div key={course.id} className={`course-card ${course.isCompleted ? 'completed' : 'pending'}`}>
                <div className="course-header">
                  <div className="course-title">
                    <h3>{course.courseName}</h3>
                    <span className="course-code">{course.courseCode}</span>
                  </div>
                  <button 
                    className={`btn-toggle ${course.isCompleted ? 'completed' : 'pending'}`}
                    onClick={() => handleUpdateCourse(course.id)}
                    title={course.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {course.isCompleted ? '✓ Completed' : '○ Pending'}
                  </button>
                </div>
                <div className="course-details">
                  <div className="course-detail">
                    <span className="detail-icon">📖</span>
                    <span>{course.credits} Credits</span>
                  </div>
                  {course.grade && (
                    <div className="course-detail">
                      <span className="detail-icon">📝</span>
                      <span>Grade: {course.grade}</span>
                    </div>
                  )}
                  {course.completionDate && (
                    <div className="course-detail">
                      <span className="detail-icon">📅</span>
                      <span>
                        Completed: {new Date(course.completionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No courses added yet</h3>
              <p>Click "Add My Course" to start tracking your progress</p>
            </div>
          )}
        </div>
      ) : (
        <div className="requirements-list">
          {requirements.length > 0 ? (
            requirements.map(req => (
              <div key={req.id} className={`requirement-card ${req.isRequired ? 'required' : 'optional'}`}>
                <div className="requirement-header">
                  <div className="requirement-title">
                    <h3>{req.courseName}</h3>
                    <span className="requirement-code">{req.courseCode}</span>
                  </div>
                  <span className={`requirement-badge ${req.isRequired ? 'required' : 'optional'}`}>
                    {req.isRequired ? 'Required' : 'Optional'}
                  </span>
                </div>
                <div className="requirement-details">
                  <div className="requirement-detail">
                    <span className="detail-icon">📖</span>
                    <span>{req.credits} Credits</span>
                  </div>
                  {req.description && (
                    <p className="requirement-description">{req.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No requirements defined</h3>
              {isAdmin && <p>Click "Add Requirement" to create course requirements</p>}
            </div>
          )}
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Course to My Record</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddCourse}>
              <div className="form-group">
                <label>Select Course *</label>
                <select
                  value={courseForm.courseRequirementId}
                  onChange={(e) => setCourseForm({ ...courseForm, courseRequirementId: e.target.value })}
                  required
                >
                  <option value="">Choose a course...</option>
                  {getAvailableRequirements().map(req => (
                    <option key={req.id} value={req.id}>
                      {req.courseCode} - {req.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={courseForm.isCompleted}
                    onChange={(e) => setCourseForm({ ...courseForm, isCompleted: e.target.checked })}
                  />
                  <span>Mark as completed</span>
                </label>
              </div>

              {courseForm.isCompleted && (
                <>
                  <div className="form-group">
                    <label>Grade</label>
                    <input
                      type="number"
                      value={courseForm.grade}
                      onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 85.5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Completion Date</label>
                    <input
                      type="date"
                      value={courseForm.completionDate}
                      onChange={(e) => setCourseForm({ ...courseForm, completionDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-save">Add Course</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Requirement Modal (Admin only) */}
      {showRequirementModal && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowRequirementModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Course Requirement</h2>
              <button className="modal-close" onClick={() => setShowRequirementModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddRequirement}>
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  value={requirementForm.courseName}
                  onChange={(e) => setRequirementForm({ ...requirementForm, courseName: e.target.value })}
                  placeholder="e.g., Software Engineering"
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Code *</label>
                <input
                  type="text"
                  value={requirementForm.courseCode}
                  onChange={(e) => setRequirementForm({ ...requirementForm, courseCode: e.target.value })}
                  placeholder="e.g., CS401"
                  required
                />
              </div>

              <div className="form-group">
                <label>Credits *</label>
                <input
                  type="number"
                  value={requirementForm.credits}
                  onChange={(e) => setRequirementForm({ ...requirementForm, credits: e.target.value })}
                  min="1"
                  placeholder="e.g., 6"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={requirementForm.isRequired}
                    onChange={(e) => setRequirementForm({ ...requirementForm, isRequired: e.target.checked })}
                  />
                  <span>Required course</span>
                </label>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={requirementForm.description}
                  onChange={(e) => setRequirementForm({ ...requirementForm, description: e.target.value })}
                  placeholder="Brief description of the course..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">Add Requirement</button>
                <button type="button" className="btn-cancel" onClick={() => setShowRequirementModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
