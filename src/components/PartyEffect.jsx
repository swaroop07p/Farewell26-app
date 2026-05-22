import React from 'react';

export default function PartyEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-9999 overflow-hidden">

      <style>
        {`

          /* =========================================
             FLOATING CONFETTI
          ========================================= */

          @keyframes confettiFall {

            0% {
              transform:
                translateY(-120vh)
                rotate(0deg)
                scale(0.8);

              opacity: 0;
            }

            10% {
              opacity: 1;
            }

            100% {
              transform:
                translateY(120vh)
                rotate(720deg)
                scale(1);

              opacity: 0;
            }
          }

          /* =========================================
             BALLOON FLOATING
          ========================================= */

          @keyframes balloonFloat {

            0% {
              transform:
                translateY(120vh)
                translateX(0px);

              opacity: 0;
            }

            10% {
              opacity: 1;
            }

            50% {
              transform:
                translateY(20vh)
                translateX(10px);
            }

            100% {
              transform:
                translateY(-130vh)
                translateX(-10px);

              opacity: 0;
            }
          }

          /* =========================================
             SOFT GLOW PULSE
          ========================================= */

          @keyframes glowPulse {

            0%, 100% {
              filter: brightness(1);
            }

            50% {
              filter: brightness(1.25);
            }
          }

          /* =========================================
             CONFETTI BASE
          ========================================= */

          .confetti {
            position: absolute;

            width: 14px;
            height: 14px;

            border-radius: 3px;

            opacity: 0;

            animation:
              confettiFall linear infinite,
              glowPulse 2s ease-in-out infinite;

            box-shadow:
              0 0 12px rgba(255,255,255,0.35);

            will-change: transform;
          }

          /* =========================================
             BALLOON BASE
          ========================================= */

          .balloon {
            position: absolute;

            width: 55px;
            height: 70px;

            border-radius: 50% 50% 45% 45%;

            opacity: 0;

            animation:
              balloonFloat linear infinite,
              glowPulse 3s ease-in-out infinite;

            box-shadow:
              inset -8px -10px 18px rgba(0,0,0,0.18),
              inset 5px 5px 12px rgba(255,255,255,0.25),
              0 10px 25px rgba(0,0,0,0.15);
          }

          /* Balloon knot */
          .balloon::after {
            content: "";

            position: absolute;

            bottom: -8px;
            left: 50%;

            transform: translateX(-50%);

            width: 10px;
            height: 10px;

            background: inherit;

            clip-path: polygon(50% 100%, 0 0, 100% 0);
          }

          /* Balloon string */
          .balloon::before {
            content: "";

            position: absolute;

            top: 100%;
            left: 50%;

            width: 2px;
            height: 80px;

            transform: translateX(-50%);

            background:
              linear-gradient(
                to bottom,
                rgba(255,255,255,0.5),
                rgba(255,255,255,0.05)
              );
          }

        `}
      </style>

      {/* =========================================
         CONFETTI
      ========================================= */}

      <div
        className="confetti bg-pink-500"
        style={{
          left: '8%',
          animationDuration: '6s',
          animationDelay: '0s'
        }}
      />

      <div
        className="confetti bg-yellow-400"
        style={{
          left: '18%',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          animationDuration: '7s',
          animationDelay: '1s'
        }}
      />

      <div
        className="confetti bg-blue-500"
        style={{
          left: '32%',
          animationDuration: '5s',
          animationDelay: '0.5s'
        }}
      />

      <div
        className="confetti bg-green-400"
        style={{
          left: '48%',
          width: '18px',
          height: '6px',
          animationDuration: '8s',
          animationDelay: '1.5s'
        }}
      />

      <div
        className="confetti bg-purple-500"
        style={{
          left: '62%',
          animationDuration: '6.5s',
          animationDelay: '0.3s'
        }}
      />

      <div
        className="confetti bg-red-500"
        style={{
          left: '78%',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          animationDuration: '7.5s',
          animationDelay: '1s'
        }}
      />

      <div
        className="confetti bg-cyan-400"
        style={{
          left: '90%',
          animationDuration: '5.5s',
          animationDelay: '0.8s'
        }}
      />

      {/* =========================================
         BALLOONS
      ========================================= */}

      <div
        className="balloon"
        style={{
          left: '12%',
          background: 'linear-gradient(to bottom, #ff4d8d, #ff005c)',
          animationDuration: '14s',
          animationDelay: '0s'
        }}
      />

      <div
        className="balloon"
        style={{
          left: '40%',
          background: 'linear-gradient(to bottom, #60a5fa, #2563eb)',
          animationDuration: '16s',
          animationDelay: '2s'
        }}
      />

      <div
        className="balloon"
        style={{
          left: '68%',
          background: 'linear-gradient(to bottom, #fcd34d, #f59e0b)',
          animationDuration: '15s',
          animationDelay: '1s'
        }}
      />

      <div
        className="balloon"
        style={{
          left: '88%',
          background: 'linear-gradient(to bottom, #c084fc, #8b5cf6)',
          animationDuration: '17s',
          animationDelay: '3s'
        }}
      />

    </div>
  );
}