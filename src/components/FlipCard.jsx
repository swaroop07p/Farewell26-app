import React, { useState } from 'react';
import { MapPin, Clock, Calendar } from 'lucide-react';

export default function FlipCard({ currentUser }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full max-w-sm cursor-pointer aspect-3/4 perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT OF CARD */}
        <div 
          className="absolute inset-0 shadow-2xl animated-glow-wrapper"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Safe Area Wrapper - Prevents layout breaking */}
          <div className="relative content-safe-area">
            <img 
              src={currentUser.invitationImage} 
              alt="Invitation Front" 
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 pt-6 pb-3 text-sm font-medium text-center text-white/90 animate-pulse bg-linear-to-t from-black/80 to-transparent">
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
            transform: 'rotateY(180deg)' /* Critical fix for the dropping back-side bug */
          }}
        >
          {/* Safe Area Wrapper - Contains your original layout perfectly */}
          <div className="flex flex-col items-center justify-between p-6 content-safe-area">
            <h2 className="mb-2 text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500">Your Entry Pass</h2>
            
            <div className="p-3 bg-white shadow-inner pointer-events-none rounded-xl">
              <img src={currentUser.QRImg} alt="Entry QR Code" className="object-contain w-48 h-48" />
            </div>
            <p className="mt-2 text-xs text-gray-400">Scan at the venue entrance</p>

            <div className="w-full p-4 mt-4 space-y-3 border bg-white/5 border-white/10 rounded-xl">
              <div className="flex items-center text-sm text-gray-200">
                <Calendar className="w-4 h-4 mr-3 text-purple-400" />
                <span>May 26th, 2026</span>
              </div>
              <div className="flex items-center text-sm text-gray-200">
                <Clock className="w-4 h-4 mr-3 text-purple-400" />
                <span>5:00 PM Onwards</span>
              </div>
              <div className="flex items-center text-sm text-gray-200">
                <MapPin className="w-4 h-4 mr-3 text-purple-400" />
                <span>Tunturu Garden Resort</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}