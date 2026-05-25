import React from 'react';

export default function GlobalBackground() {
  return (
    <>
      {/* 🎨 THEME CONTROL: Base App Background Color */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#020617]">
        
        {/* 🎨 THEME CONTROL: Massive Neon Energetic Orbs */}
        <div className="absolute w-[85vw] h-[85vw] max-w-[600px] max-h-[600px] bg-cyan-500/25 rounded-full blur-[70px] party-blob-one"></div>
        <div className="absolute w-[80vw] h-[80vw] max-w-[550px] max-h-[550px] bg-emerald-500/20 rounded-full blur-[80px] party-blob-two"></div>
        
        {/* Active Mid-layer highlights for maximum movement on mobile screen views */}
        <div className="absolute w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-blue-500/25 rounded-full blur-[60px] party-blob-three"></div>
        <div className="absolute w-[50vw] h-[50vw] max-w-[300px] max-h-[300px] bg-cyan-400/20 rounded-full blur-[50px] party-blob-four"></div>
        <div className="absolute w-[45vw] h-[45vw] max-w-[250px] max-h-[250px] bg-emerald-400/25 rounded-full blur-[45px] party-blob-five"></div>
      </div>

      <style>{`
        /* 🎨 DYNAMIC PARTY CONTROL: Faster speeds, structural scaling, and wild hue shifts */
        .party-blob-one { 
          top: -10%; 
          left: -10%; 
          animation: partyWander1 8s infinite linear; 
        }
        .party-blob-two { 
          bottom: -10%; 
          right: -10%; 
          animation: partyWander2 9s infinite ease-in-out; 
        }
        .party-blob-three { 
          top: 25%; 
          right: -5%; 
          animation: partyWander3 7s infinite cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .party-blob-four { 
          bottom: 20%; 
          left: -5%; 
          animation: partyWander4 5s infinite linear alternate; 
        }
        .party-blob-five { 
          top: 35%; 
          left: 30%; 
          animation: partyWander5 6s infinite ease-in-out alternate; 
        }

        /* 🚀 THE CRAZY MOTION ENGINE MATH */
        @keyframes partyWander1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); filter: hue-rotate(0deg) blur(70px); }
          50% { transform: translate(50vw, 30vh) scale(1.3) rotate(180deg); filter: hue-rotate(60deg) blur(50px); }
          100% { transform: translate(-5vw, 70vh) scale(0.9) rotate(360deg); filter: hue-rotate(0deg) blur(70px); }
        }
        
        @keyframes partyWander2 {
          0% { transform: translate(0, 0) scale(1.1) rotate(360deg); filter: hue-rotate(0deg) blur(80px); }
          50% { transform: translate(-55vw, -45vh) scale(0.8) rotate(180deg); filter: hue-rotate(-60deg) blur(90px); }
          100% { transform: translate(5vw, -75vh) scale(1.1) rotate(0deg); filter: hue-rotate(0deg) blur(80px); }
        }
        
        @keyframes partyWander3 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-35vw, 40vh) scale(1.25); }
          66% { transform: translate(20vw, -15vh) scale(0.75); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        @keyframes partyWander4 {
          0% { transform: translate(0, 0) scale(0.85); filter: hue-rotate(0deg); }
          100% { transform: translate(65vw, -60vh) scale(1.35); filter: hue-rotate(90deg); }
        }
        
        @keyframes partyWander5 {
          0% { transform: translate(0, 0) scale(1.2); }
          100% { transform: translate(-45vw, 45vh) scale(0.75); }
        }
      `}</style>
    </>
  );
}