import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * Role-based Route Guard
 * Only allows users with specific roles to access the route
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const userInfo = authService.getUserInfo();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
  const hasPermission = allowedRoles.some(role => userRoles.includes(role));

  if (!hasPermission) {
    return (
      <div style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>X</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You don't have permission to access this page.
          <br />
          This page is only available for {allowedRoles.join(' and ')} roles.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
