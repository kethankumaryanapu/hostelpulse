import React, { useState } from 'react';
import { useAuth } from './shared/AuthContext';
import { Navbar } from './shared/Navbar';
import { Login } from './shared/Login';
import { StudentRegistration } from './portals/student/StudentRegistration';
import { WardenRegistration } from './portals/warden/WardenRegistration';
import { StudentDashboard } from './portals/student/StudentDashboard';
import { WardenDashboard } from './portals/warden/WardenDashboard';
import { AdminDashboard } from './portals/staff/AdminDashboard';

export function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'student_male' | 'student_female' | 'warden'
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
          </div>
          <div style={{ fontWeight: '600' }}>Loading HostelPulse...</div>
        </div>
      </div>
    );
  }

  // Not logged in -> Auth screens
  if (!isAuthenticated || !user) {
    if (viewMode === 'student_male') {
      return <StudentRegistration initialGender="male" onBackToLogin={() => setViewMode('login')} />;
    }
    if (viewMode === 'student_female') {
      return <StudentRegistration initialGender="female" onBackToLogin={() => setViewMode('login')} />;
    }
    if (viewMode === 'warden') {
      return <WardenRegistration onBackToLogin={() => setViewMode('login')} />;
    }
    return <Login onNavigateRegister={mode => setViewMode(mode)} />;
  }

  // Authenticated Portal Router
  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {user.role === 'student' && <StudentDashboard activeTab={activeTab} />}
        {user.role === 'warden' && <WardenDashboard activeTab={activeTab} />}
        {['admin', 'mess', 'maintenance', 'health_assistant', 'security'].includes(user.role) && (
          <AdminDashboard activeTab={activeTab} />
        )}
      </main>
    </div>
  );
}

export default App;
