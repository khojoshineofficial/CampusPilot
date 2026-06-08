import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard      from '../components/dashboard/StudentDashboard';
import LecturerDashboard     from '../components/dashboard/LecturerDashboard';
import AdminDashboardWidget  from '../components/dashboard/AdminDashboardWidget';
import ClubDashboard         from '../components/dashboard/ClubDashboard';
import LoadingSpinner        from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;
  if (!user)   return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboardWidget user={user} />;

    case 'lecturer':
      return <LecturerDashboard user={user} />;

    case 'club':
    case 'organization':
    case 'department':
      return <ClubDashboard user={user} />;

    case 'student':
    default:
      return <StudentDashboard user={user} />;
  }
};

export default DashboardPage;
