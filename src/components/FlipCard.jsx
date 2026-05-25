import React, { useState } from 'react';
import { MapPin, Clock, Calendar } from 'lucide-react';

export default function FlipCard({ currentUser }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full max-w-sm cursor-pointer aspect-[2/3] perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT OF CARD */}
        <div 
          className="absolute inset-0 shadow-2xl animated-glow-wrapper"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* THE CRITICAL FIX: Removed 'h-full w-full' from this div. 
              The CSS 'inset' now controls the size perfectly, leaving the border exposed. */}
          <div className="content-safe-area">
            <img 
              src={currentUser.invitationImage} 
              alt="Invitation Front" 
              className="object-fill w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 pt-6 pb-3 text-sm font-medium text-center text-white/90 animate-pulse bg-gradient-to-t from-black/80 to-transparent">
              Tap to flip for details
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div 
          className="absolute inset-0 shadow-2xl animated-glow-wrapper"
          style={{ 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* THE CRITICAL FIX: Removed 'h-full w-full' here as well */}
          <div className="flex flex-col items-center justify-between p-6 content-safe-area">
            <h2 className="mb-2 text-xl font-bold tracking-widest text-transparent uppercase bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
              Your Entry Pass
            </h2>
            
            <div className="p-3 bg-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-white/20 pointer-events-none rounded-xl">
              <img src={currentUser.QRImg} alt="Entry QR Code" className="object-contain w-48 h-48 bg-white rounded-lg mix-blend-screen" />
            </div>
            <p className="mt-2 text-xs font-black tracking-widest uppercase text-cyan-400/60">
              Scan at the venue entrance
            </p>

            <div className="w-full p-4 mt-4 space-y-3 border shadow-inner bg-black/40 border-white/10 rounded-xl">
              <div className="flex items-center text-sm font-medium text-gray-200">
                <Calendar className="w-4 h-4 mr-3 text-cyan-400" />
                <span>May 26th, 2026</span>
              </div>
              <div className="flex items-center text-sm font-medium text-gray-200">
                <Clock className="w-4 h-4 mr-3 text-emerald-400" />
                <span>6:00 PM Onwards</span>
              </div>
              <div className="flex items-center text-sm font-medium text-gray-200">
                <MapPin className="w-4 h-4 mr-3 text-cyan-400" />
                <span>Tunturu Garden Resort</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}