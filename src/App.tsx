import React, { useState } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RegisterForm from './components/RegisterForm';
import AttendanceCheck from './components/AttendanceCheck';
import MembersList from './components/MembersList';
import LeadersManager from './components/LeadersManager';
import ReportsSection from './components/ReportsSection';
import TransitionManager from './components/TransitionManager';
import { Profile } from './types';

function App() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const allProfiles: Profile[] = [
    {
      id: 'r21-kids',
      name: 'R21 Kids',
      displayName: 'R21 KIDS PALMERAS',
      subtitle: 'Sistema de asistencia del Club Infantil',
      logo: '🧸',
      password: '1234',
      ageRange: { min: 1, max: 9 },
      memberLabel: 'niño',
      showPFI: false,
      leaderLabel: 'Maestra Dominical',
      systemName: 'Club Infantil'
    },
    {
      id: 'estacion-r21',
      name: 'Estación R21',
      displayName: 'ESTACIÓN R21 PALMERAS',
      subtitle: 'Sistema de asistencia de los Preadolescentes',
      logo: '🚀',
      password: '1234',
      ageRange: { min: 10, max: 13 },
      memberLabel: 'preadolescente',
      showPFI: false,
      leaderLabel: 'Líder Preadolescente',
      systemName: 'Preadolescentes'
    },
    {
      id: 'zona-r21',
      name: 'Zona R21',
      displayName: 'ZONA R21 PALMERAS',
      subtitle: 'Sistema de asistencia de los Adolescentes',
      logo: '⚡',
      password: '1234',
      ageRange: { min: 14, max: 17 },
      memberLabel: 'adolescente',
      showPFI: false,
      leaderLabel: 'Líder Adolescente',
      systemName: 'Adolescentes'
    },
    {
      id: 'renovacion-21',
      name: 'Renovación 21',
      displayName: 'RENOVACIÓN 21 PALMERAS',
      subtitle: 'Sistema de asistencia Juvenil',
      logo: '🔥',
      password: '1234',
      ageRange: { min: 18, max: 99 },
      memberLabel: 'joven',
      showPFI: true,
      leaderLabel: 'Líder Juvenil',
      systemName: 'Juvenil'
    },
    {
      id: 'admin',
      name: 'Administrador',
      displayName: 'PANEL DE ADMINISTRACIÓN',
      subtitle: 'Gestión completa del sistema',
      logo: '👑',
      password: '1234',
      ageRange: { min: 0, max: 99 },
      memberLabel: 'usuario',
      showPFI: true,
      leaderLabel: 'Administrador',
      systemName: 'Sistema'
    }
  ];

  const handleLogin = (profile: Profile) => {
    setCurrentProfile(profile);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentProfile(null);
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    if (!currentProfile) return null;

    switch (currentPage) {
      case 'register':
        return <RegisterForm currentProfile={currentProfile} />;
      case 'attendance':
        return <AttendanceCheck currentProfile={currentProfile} />;
      case 'members':
        return <MembersList currentProfile={currentProfile} />;
      case 'leaders':
        return <LeadersManager currentProfile={currentProfile} />;
      case 'reports':
        return <ReportsSection currentProfile={currentProfile} />;
      case 'transitions':
        return <TransitionManager currentProfile={currentProfile} allProfiles={allProfiles} />;
      default:
        return <Dashboard currentProfile={currentProfile} />;
    }
  };

  if (!currentProfile) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage}
      currentProfile={currentProfile}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;