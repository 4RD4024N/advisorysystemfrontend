import { useState, useEffect } from 'react';
import { studentProfileService, advisorService, authService } from '../services';
import './StudentProfile.css';

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [prerequisites, setPrerequisites] = useState(null);
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    studentNumber: '',
    department: '',
    gpa: '',
    completedCredits: '',
    enrollmentDate: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const userInfo = authService.getUserInfo();

  useEffect(() => {
    loadProfile();
    checkPrerequisites();
    loadAdvisor(); // ✨ NEW v2.1: Load advisor information
  }, []);

  const loadProfile = async () => {
    try {
      const data = await studentProfileService.getMyProfile();
      if (data) {
        setProfile(data);
        setFormData({
          studentNumber: data.studentNumber || '',
          department: data.department || '',
          gpa: data.gpa || '',
          completedCredits: data.completedCredits || '',
          enrollmentDate: data.enrollmentDate ? data.enrollmentDate.split('T')[0] : ''
        });
      } else {
        setEditing(true); // No profile exists, go to edit mode
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const checkPrerequisites = async () => {
    try {
      const data = await studentProfileService.checkPrerequisites();
      setPrerequisites(data);
    } catch (error) {
      console.error('Failed to check prerequisites:', error);
    }
  };

  const loadAdvisor = async () => {
    try {
      const data = await advisorService.getMyAdvisor();
      setAdvisor(data);
    } catch (error) {
      console.error('Failed to load advisor:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // Form verilerini hazırla
      const dataToSend = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        completedCredits: formData.completedCredits ? parseInt(formData.completedCredits) : null,
        enrollmentDate: formData.enrollmentDate || null
      };

      await studentProfileService.saveProfile(dataToSend);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setEditing(false);
      loadProfile();
      checkPrerequisites();
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save profile' });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        studentNumber: profile.studentNumber || '',
        department: profile.department || '',
        gpa: profile.gpa || '',
        completedCredits: profile.completedCredits || '',
        enrollmentDate: profile.enrollmentDate ? profile.enrollmentDate.split('T')[0] : ''
      });
      setEditing(false);
    }
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="student-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="student-profile-container">
      <div className="profile-header">
        <div>
          <h1>Student Profile</h1>
          <p className="profile-subtitle">{userInfo?.email}</p>
        </div>
        {!editing && profile && (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {advisor && (
        <div className={`advisor-card ${advisor.hasAdvisor ? 'has-advisor' : 'no-advisor'}`}>
          <h2>👨‍🏫 My Advisor</h2>
          {advisor.hasAdvisor ? (
            <div className="advisor-details">
              <div className="advisor-info">
                <div className="advisor-name">{advisor.advisor.userName}</div>
                <div className="advisor-email">{advisor.advisor.email}</div>
              </div>
              <div className="advisor-status">
                <span className="status-badge assigned">Assigned</span>
              </div>
            </div>
          ) : (
            <div className="no-advisor-message">
              <div className="no-advisor-icon">📭</div>
              <p>You don't have an advisor assigned yet.</p>
              <p className="text-muted">Please contact administration.</p>
            </div>
          )}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Student Number</label>
            <input
              type="text"
              name="studentNumber"
              value={formData.studentNumber}
              onChange={handleInputChange}
              placeholder="e.g., 20240001"
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GPA</label>
              <input
                type="number"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                min="0"
                max="4"
                step="0.01"
                placeholder="e.g., 3.75"
              />
            </div>

            <div className="form-group">
              <label>Completed Credits</label>
              <input
                type="number"
                name="completedCredits"
                value={formData.completedCredits}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g., 120"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Enrollment Date</label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              Save Profile
            </button>
            {profile && (
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="profile-view">
          {profile ? (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Student Number:</span>
                <span className="detail-value">{profile.studentNumber || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{profile.department || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">GPA:</span>
                <span className="detail-value">{profile.gpa ? profile.gpa.toFixed(2) : 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completed Credits:</span>
                <span className="detail-value">{profile.completedCredits || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Enrollment Date:</span>
                <span className="detail-value">
                  {profile.enrollmentDate 
                    ? new Date(profile.enrollmentDate).toLocaleDateString() 
                    : 'Not set'}
                </span>
              </div>
            </div>
          ) : (
            <div className="no-profile">
              <p>No profile found. Click "Edit Profile" to create one.</p>
            </div>
          )}
        </div>
      )}

      {prerequisites && (
        <div className={`prerequisites-card ${prerequisites.meetsPrerequisites ? 'success' : 'warning'}`}>
          <h2>Prerequisites Check</h2>
          <div className="prerequisite-status">
            <div className="status-icon">
              {prerequisites.meetsPrerequisites ? 'Yes' : 'No'}
            </div>
            <div className="status-message">
              {prerequisites.message}
            </div>
          </div>

          <div className="prerequisite-details">
            <div className="prerequisite-item">
              <span className="prerequisite-label">Credits:</span>
              <span className={`prerequisite-value ${prerequisites.completedCredits >= prerequisites.requiredCredits ? 'met' : 'not-met'}`}>
                {prerequisites.completedCredits} / {prerequisites.requiredCredits}
              </span>
            </div>
            <div className="prerequisite-item">
              <span className="prerequisite-label">Required Courses:</span>
              <span className={`prerequisite-value ${prerequisites.completedCoursesCount >= prerequisites.requiredCoursesCount ? 'met' : 'not-met'}`}>
                {prerequisites.completedCoursesCount} / {prerequisites.requiredCoursesCount}
              </span>
            </div>
            {prerequisites.gpa && (
              <div className="prerequisite-item">
                <span className="prerequisite-label">GPA:</span>
                <span className="prerequisite-value met">
                  {prerequisites.gpa.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfile;
