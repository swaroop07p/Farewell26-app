import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 pb-safe z-50 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
      {/* Changed to justify-around to evenly space the two buttons */}
      <div className="flex justify-around items-center max-w-md mx-auto">
        
        {/* Left: Invite Button */}
        <button 
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center transition-all duration-300 ${location.pathname === '/home' ? 'text-purple-400 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Home size={22} />
          <span className="text-[10px] mt-1 font-bold tracking-wider">INVITE</span>
        </button>
        
        {/* Right: Guest List Button */}
        <button 
          onClick={() => navigate('/tracker')}
          className={`flex flex-col items-center transition-all duration-300 ${location.pathname === '/tracker' ? 'text-pink-400 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Users size={22} />
          <span className="text-[10px] mt-1 font-bold tracking-wider">GUESTS</span>
        </button>

      </div>
    </div>
  );
}