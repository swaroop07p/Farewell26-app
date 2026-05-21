import React, { useState } from 'react';
import { MapPin, Clock, Calendar } from 'lucide-react';

export default function FlipCard({ currentUser }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full max-w-sm aspect-3/4 perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT OF CARD */}
        <div className="absolute inset-0 backface-hidden rounded-2xl shadow-2xl overflow-hidden border-2 border-white/20">
          <img 
            src={currentUser.invitationImage} 
            alt="Invitation Front" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 text-center text-white/90 text-sm font-medium animate-pulse bg-linear-to-t from-black/80 to-transparent pt-6 pb-3">
            Tap to flip for details
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-2xl bg-gray-900 border-2 border-purple-500/50 p-6 flex flex-col items-center justify-between">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500 mb-2">Your Entry Pass</h2>
          
          <div className="bg-white p-3 rounded-xl shadow-inner pointer-events-none">
            <img src={currentUser.QRImg} alt="Entry QR Code" className="w-48 h-48 object-contain" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Scan at the venue entrance</p>

          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mt-4 space-y-3">
            <div className="flex items-center text-gray-200 text-sm">
              <Calendar className="w-4 h-4 mr-3 text-purple-400" />
              <span>May 26th, 2026</span>
            </div>
            <div className="flex items-center text-gray-200 text-sm">
              <Clock className="w-4 h-4 mr-3 text-purple-400" />
              <span>6:00 PM Onwards</span>
            </div>
            <div className="flex items-center text-gray-200 text-sm">
              <MapPin className="w-4 h-4 mr-3 text-purple-400" />
              <span>Tunturu Garden Resort</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}