import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Tracker from "./pages/Tracker";
import BottomNav from "./components/BottomNav";
import Scanner from "./pages/Scanner";
import Teams from "./pages/Teams";
import GlobalBackground from "./components/GlobalBackground";

// Clean Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  if (loading) return null;
  return currentUser ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
      <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* 🎨 THEME CONTROL: Render mobile-optimized blobs globally */}
        <GlobalBackground />
        
        {/* Force transparency so the background shines through everywhere */}
        <div className="relative w-full min-h-screen overflow-x-hidden text-white bg-transparent">
          <AppRoutes />
        </div>
        
        {/* The Navbar will safely hide itself on Login and Scanner pages */}
        <BottomNav />
      </BrowserRouter>
    </AuthProvider>
  );
}