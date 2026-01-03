import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Submissions from './pages/Submissions';
import Statistics from './pages/Statistics';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Courses from './pages/Courses';
import CourseSchedule from './pages/CourseSchedule';
import AssignAdvisor from './pages/AssignAdvisor'; // v3.0 - Admin Öğretmen Atama Sistemi
import CreateSubmission from './pages/CreateSubmission';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          
          {/* Submissions - Student only */}
          <Route 
            path="/submissions" 
            element={
              <RoleBasedRoute allowedRoles={['Student']}>
                <Submissions />
              </RoleBasedRoute>
            } 
          />
          
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Student Profile - Student only */}
          <Route 
            path="/student-profile" 
            element={
              <RoleBasedRoute allowedRoles={['Student']}>
                <StudentProfile />
              </RoleBasedRoute>
            } 
          />
          
          {/* Courses - All authenticated users */}
          <Route path="/courses" element={<Courses />} />
          
          {/* Course Schedule - Student only */}
          <Route 
            path="/course-schedule" 
            element={
              <RoleBasedRoute allowedRoles={['Student']}>
                <CourseSchedule />
              </RoleBasedRoute>
            } 
          />
          
          {/* Students page - Admin and Advisor only */}
          <Route 
            path="/students" 
            element={
              <RoleBasedRoute allowedRoles={['Admin', 'Advisor']}>
                <Students />
              </RoleBasedRoute>
            } 
          />
          
          /* Assign Advisor - Admin only (v3.0 - Student-based assignment) */
          <Route 
            path="/assign-advisor" 
            element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <AssignAdvisor />
              </RoleBasedRoute>
            } 
          />
          
          {/* Create Submission - Advisor only */}
          <Route 
            path="/create-submission" 
            element={
              <RoleBasedRoute allowedRoles={['Advisor']}>
                <CreateSubmission />
              </RoleBasedRoute>
            } 
          />
          
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
