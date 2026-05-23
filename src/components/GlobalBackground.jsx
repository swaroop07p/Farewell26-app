import React from 'react';

export default function GlobalBackground() {
  return (
    <>
      {/* 🎨 THEME CONTROL: Base App Background Color */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#090d1a]">
        
        {/* 🎨 THEME CONTROL: Large Ambient Blobs (Slow, background foundation) */}
        <div className="absolute w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-cyan-500/20 rounded-full blur-[80px] blob-one"></div>
        <div className="absolute w-[55vw] h-[55vw] max-w-[450px] max-h-[450px] bg-emerald-500/15 rounded-full blur-[80px] blob-two"></div>
        
        {/* 🎨 THEME CONTROL: Medium/Small Fast Blobs (Active mobile motion) */}
        <div className="absolute w-[40vw] h-[40vw] max-w-[300px] max-h-[300px] bg-blue-600/20 rounded-full blur-[60px] blob-three"></div>
        <div className="absolute w-[30vw] h-[30vw] max-w-[200px] max-h-[200px] bg-cyan-400/20 rounded-full blur-[50px] blob-four"></div>
        <div className="absolute w-[25vw] h-[25vw] max-w-[180px] max-h-[180px] bg-emerald-400/20 rounded-full blur-[40px] blob-five"></div>
      </div>

      <style>{`
        /* 🎨 THEME CONTROL: Animation Speed & Paths */
        .blob-one { top: -10%; left: -10%; animation: wander1 12s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .blob-two { bottom: -10%; right: -10%; animation: wander2 14s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .blob-three { top: 20%; right: 20%; animation: wander3 9s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        .blob-four { bottom: 30%; left: 10%; animation: wander4 7s infinite linear alternate; }
        .blob-five { top: 40%; left: 40%; animation: wander5 8s infinite ease-in-out alternate; }

        /* Expanded vw/vh ranges so motion is highly visible on narrow phone screens */
        @keyframes wander1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60vw, 40vh) scale(1.2); }
          100% { transform: translate(-10vw, 80vh) scale(0.9); }
        }
        @keyframes wander2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60vw, -50vh) scale(1.3); }
          100% { transform: translate(10vw, -80vh) scale(0.8); }
        }
        @keyframes wander3 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40vw, 60vh) scale(0.8); }
          100% { transform: translate(30vw, -20vh) scale(1.4); }
        }
        @keyframes wander4 {
          0% { transform: translate(0, 0) scale(0.9); }
          100% { transform: translate(70vw, -70vh) scale(1.2); }
        }
        @keyframes wander5 {
          0% { transform: translate(0, 0) scale(1.1); }
          100% { transform: translate(-50vw, 50vh) scale(0.7); }
        }
      `}</style>
    </>
  );
}