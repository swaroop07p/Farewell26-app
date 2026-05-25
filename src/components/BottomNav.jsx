import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Trophy, Menu, LogOut} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  // 🛡️ SECURITY & UI FIX: Never render the nav bar on Login or Scanner
  if (location.pathname === '/' || location.pathname === '/scanner') {
    return null;
  }

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };
  
  return (
    <>
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed bottom-24 left-6 bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-[140px]">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 space-x-3 font-bold text-left text-red-400 transition-colors rounded-lg hover:bg-red-500/20"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="text-xs tracking-wider uppercase">Logout</span>
            </button>
          </div>
        </>
      )}

      {/* 🎨 THEME CONTROL: Bottom Navbar Glassmorphism */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#020617]/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 pb-safe z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center transition-all duration-300 w-16 ${isMenuOpen ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Menu size={22} />
            <span className="text-[10px] mt-1 font-bold tracking-wider">MENU</span>
          </button>

          <button 
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center transition-all duration-300 w-16 ${location.pathname === '/home' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Home size={22} />
            <span className="text-[10px] mt-1 font-bold tracking-wider">INVITE</span>
          </button>

          <button 
            onClick={() => navigate('/teams')}
            className={`flex flex-col items-center transition-all duration-300 w-16 ${location.pathname === '/teams' ? 'text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Trophy size={22} />
            <span className="text-[10px] mt-1 font-bold tracking-wider">TEAMS</span>
          </button>
          
          <button 
            onClick={() => navigate('/tracker')}
            className={`flex flex-col items-center transition-all duration-300 w-16 ${location.pathname === '/tracker' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Users size={22} />
            <span className="text-[10px] mt-1 font-bold tracking-wider">GUESTS</span>
          </button>
        </div>
      </div>
    </>
  );
}