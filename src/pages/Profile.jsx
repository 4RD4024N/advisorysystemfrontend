import React from 'react';
import { authService } from '../services';

const Profile = () => {
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div>
      <h1 className="mb-4">Profile</h1>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-header">Account Information</h2>
          
          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Email</div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {localStorage.getItem('userEmail') || 'Not available'}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Account Status</div>
            <span className="badge badge-success">Active</span>
          </div>

          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>

        <div className="card">
          <h2 className="card-header">Settings</h2>
          
          <div className="alert alert-info">
            <strong>Note:</strong> Additional profile settings and preferences will be available in future updates.
          </div>

          <div className="mb-3">
            <div className="text-sm text-muted mb-1">API Base URL</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
              https://localhost:7175/api
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm text-muted mb-1">Token Status</div>
            <span className={`badge ${authService.isAuthenticated() ? 'badge-success' : 'badge-danger'}`}>
              {authService.isAuthenticated() ? 'Valid' : 'Invalid'}
            </span>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <h2 className="card-header">Help & Documentation</h2>
        <div className="grid grid-3">
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Documentation</div>
            <div className="text-sm text-muted">Check README.md for detailed guides</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔧</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>API Reference</div>
            <div className="text-sm text-muted">See API_QUICK_REFERENCE.md</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>Support</div>
            <div className="text-sm text-muted">Contact your administrator</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
