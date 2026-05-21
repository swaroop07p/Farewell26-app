import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Tracker from './pages/Tracker';
import BottomNav from './components/BottomNav';
import Scanner from './pages/Scanner';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  if (loading) return null;
  
  return currentUser ? (
    <>
      {children}
      <BottomNav />
    </>
  ) : (
    <Navigate to="/" />
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
      {/* NEW ROUTE */}
      <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}