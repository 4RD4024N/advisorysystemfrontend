import React, { useState, useEffect } from 'react';
import { submissionService } from '../services';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await submissionService.getMySubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await submissionService.updateStatus(id, status);
      loadSubmissions();
    } catch (error) {
      alert('Failed to update status: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="loading" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">My Submissions</h1>

      {submissions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-text">No submissions yet</div>
            <div className="empty-state-subtext">Your advisor will assign submissions to you</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {submissions.map((submission) => (
            <div key={submission.id} className="card">
              <div className="flex-between mb-3">
                <h3 style={{ margin: 0, fontSize: '18px' }}>Submission #{submission.id}</h3>
                <span className={`badge ${submission.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                  {submission.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="text-sm text-muted mb-1">Due Date</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>
                  {new Date(submission.dueDate).toLocaleDateString()}
                </div>
              </div>

              {submission.status === 'Pending' && (
                <button
                  onClick={() => handleStatusChange(submission.id, 'Completed')}
                  className="btn btn-success btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Mark as Completed
                </button>
              )}

              {submission.status === 'Completed' && (
                <button
                  onClick={() => handleStatusChange(submission.id, 'Pending')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Mark as Pending
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
