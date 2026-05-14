import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { UserDashboard } from './pages/UserDashboard';
import { Booking } from './pages/Booking';
import { MyBookings } from './pages/MyBookings';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode, role?: 'user' | 'admin' }> = ({ children, role }) => {
  const { user } = useApp();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/book/:lotId" 
        element={
          <ProtectedRoute role="user">
            <Booking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bookings" 
        element={
          <ProtectedRoute role="user">
            <MyBookings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}