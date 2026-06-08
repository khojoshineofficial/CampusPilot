// Admin dashboard is now handled by DashboardPage → AdminDashboardWidget for role=admin.
// This file re-exports AdminDashboardWidget so the /admin route still works.
import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboardWidget from '../components/dashboard/AdminDashboardWidget';

const AdminDashboard = () => {
  const { user } = useAuth();
  return <AdminDashboardWidget user={user} />;
};

export default AdminDashboard;
