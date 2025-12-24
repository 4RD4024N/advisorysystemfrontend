import { useState, useEffect } from 'react';
import { studentService, advisorService, authService } from '../services';
import './Students.css';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'without-advisor', 'pending'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [notificationData, setNotificationData] = useState({ title: '', message: '' });
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role
    const userInfo = authService.getUserInfo();
    setUserRole(userInfo?.role);
    loadStudents();
  }, [filter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filter === 'without-advisor') {
        data = await studentService.getStudentsWithoutAdvisor();
        // These endpoints return array directly
        setStudents(Array.isArray(data) ? data : []);
      } else if (filter === 'pending') {
        data = await studentService.getStudentsWithPendingSubmissions();
        // These endpoints return array directly
        setStudents(Array.isArray(data) ? data : []);
      } else {
        // getAllStudents returns paginated response: { students, totalCount, page, ... }
        data = await studentService.getAllStudents();
        setStudents(Array.isArray(data.students) ? data.students : []);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      if (error.response?.status === 403) {
        alert('You can only access students assigned to you');
      }
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (studentId) => {
    if (!notificationData.title || !notificationData.message) {
      alert('Please fill in title and message');
      return;
    }

    try {
      await studentService.sendNotification(studentId, notificationData);
      alert('Notification sent successfully!');
      setShowNotificationModal(false);
      setNotificationData({ title: '', message: '' });
    } catch (error) {
      console.error('Failed to send notification:', error);
      if (error.response?.status === 403) {
        alert('You can only send notifications to students assigned to you');
      } else {
        alert('Failed to send notification');
      }
    }
  };

  const handleSendBulkNotification = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (!notificationData.title || !notificationData.message) {
      alert('Please fill in title and message');
      return;
    }

    try {
      const response = await studentService.sendBulkNotification({
        studentIds: selectedStudents,
        ...notificationData
      });
      
      // Show success/error details if available
      if (response.errors && response.errors.length > 0) {
        alert(`Sent to ${response.successCount} students. Failed: ${response.failedCount}\n${response.errors.join('\n')}`);
      } else {
        alert(`Notification sent to ${selectedStudents.length} students!`);
      }
      
      setShowBulkModal(false);
      setSelectedStudents([]);
      setNotificationData({ title: '', message: '' });
    } catch (error) {
      console.error('Failed to send bulk notification:', error);
      if (error.response?.status === 403) {
        alert('You can only send notifications to students assigned to you');
      } else {
        alert('Failed to send notifications');
      }
    }
  };

  const handleSendToAll = async () => {
    if (!notificationData.title || !notificationData.message) {
      alert('Please fill in title and message');
      return;
    }

    if (!confirm('Send notification to ALL students?')) {
      return;
    }

    try {
      await studentService.sendNotificationToAll(notificationData);
      alert('Notification sent to all students!');
      setShowBulkModal(false);
      setNotificationData({ title: '', message: '' });
    } catch (error) {
      console.error('Failed to send notification to all:', error);
      alert('Failed to send notifications');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getStatusBadge = (student) => {
    if (filter === 'without-advisor') {
      return <span className="badge badge-warning">No Advisor</span>;
    }
    if (filter === 'pending' && student.pendingSubmissions > 0) {
      return <span className="badge badge-danger">{student.pendingSubmissions} Pending</span>;
    }
    return <span className="badge badge-success">Active</span>;
  };

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <h1>Students Management</h1>
          <p>Manage students, advisors, and notifications</p>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => setShowBulkModal(true)}
        >
          📨 Send Notification
        </button>
      </div>

      <div className="students-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {userRole === 'Admin' ? 'All Students' : 'My Students'}
        </button>
        {userRole === 'Admin' && (
          <button 
            className={`filter-btn ${filter === 'without-advisor' ? 'active' : ''}`}
            onClick={() => setFilter('without-advisor')}
          >
            Without Advisor
          </button>
        )}
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending Submissions
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍🎓</div>
          <h3>No students found</h3>
          <p>
            {filter === 'without-advisor' 
              ? 'All students have advisors assigned' 
              : filter === 'pending'
              ? 'No students with pending submissions'
              : 'No students in the system'}
          </p>
        </div>
      ) : (
        <>
          {selectedStudents.length > 0 && (
            <div className="selection-toolbar">
              <span>{selectedStudents.length} students selected</span>
              <button 
                className="btn-secondary"
                onClick={() => setShowBulkModal(true)}
              >
                Send Notification to Selected
              </button>
              <button 
                className="btn-text"
                onClick={() => setSelectedStudents([])}
              >
                Clear Selection
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
                    <span className="detail-label">Registration No:</span>
                    <span className="detail-value">{student.registrationNo || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{student.department || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* ✨ NEW v2.1: Display advisor information */}
                  <div className="detail-item">
                    <span className="detail-label">👨‍🏫 Advisor:</span>
                    {student.hasAdvisor && student.advisor ? (
                      <span className="detail-value" style={{ color: '#10b981', fontWeight: '600' }}>
                        {student.advisor.userName}
                      </span>
                    ) : (
                      <span className="detail-value" style={{ color: '#f59e0b' }}>
                        Not Assigned
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
                    📨 Send Notification
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>No students found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Single Student Notification Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Notification</h2>
              <button 
                className="modal-close"
                onClick={() => setShowNotificationModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">
                To: {selectedStudent?.fullName}
              </p>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={e => setNotificationData({...notificationData, title: e.target.value})}
                  placeholder="Notification title"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={notificationData.message}
                  onChange={e => setNotificationData({...notificationData, message: e.target.value})}
                  placeholder="Notification message"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowNotificationModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleSendNotification(selectedStudent.id)}
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Notification Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Bulk Notification</h2>
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
                  ? `To: ${selectedStudents.length} selected students`
                  : 'To: All students'}
              </p>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={e => setNotificationData({...notificationData, title: e.target.value})}
                  placeholder="Notification title"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={notificationData.message}
                  onChange={e => setNotificationData({...notificationData, message: e.target.value})}
                  placeholder="Notification message"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
              {selectedStudents.length > 0 ? (
                <button 
                  className="btn-primary"
                  onClick={handleSendBulkNotification}
                >
                  Send to Selected ({selectedStudents.length})
                </button>
              ) : userRole === 'Admin' ? (
                <button 
                  className="btn-danger"
                  onClick={handleSendToAll}
                >
                  Send to All Students
                </button>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={handleSendBulkNotification}
                  disabled
                >
                  Select Students to Send
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
