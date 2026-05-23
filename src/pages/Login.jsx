import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import confetti from "canvas-confetti";
import PartyEffect from "../components/PartyEffect";
import { KeyRound } from "lucide-react";
import Loader from "../components/Loader";

export default function Login() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [error, setError] = useState("");
  const [showBalloons, setShowBalloons] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.isScanner) navigate("/scanner");
      else navigate("/home");
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(name.toUpperCase(), usn);

    if (result.success) {
      if (result.isScanner) {
        navigate("/scanner");
        return;
      }

      // 🎨 THEME CONTROL: Confetti Colors matched to Cyan/Emerald
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22d3ee", "#10b981", "#3b82f6", "#67e8f9", "#6ee7b7"],
      });

      setTimeout(() => navigate("/home"), 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    // 🎨 THEME CONTROL: bg-transparent wrapper
    <div className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden bg-transparent">
      {showBalloons && <PartyEffect />}

      <div className="w-full max-w-md h-120 perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          {/* FRONT SIDE */}
          <div
            // 🎨 THEME CONTROL: Front Card Glassmorphism
            className="absolute inset-0 bg-[#020617]/50 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.8)] border border-white/10 z-10 flex flex-col items-center justify-center cursor-pointer backface-hidden"
            onClick={() => setIsFlipped(true)}
          >
            <h1 className="mb-4 text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
              The Grand Send-Off: Celebrating Our Seniors
            </h1>
            <p className="mb-8 font-medium tracking-wide text-center text-cyan-100/80">
              Tap to Unlock Your Invitation
            </p>
            <div className="relative flex items-center justify-center w-32 h-32">
              <div className="absolute inset-0 scale-110 pointer-events-none">
                <Loader />
              </div>
              <KeyRound size={40} className="text-cyan-400 fill-cyan-400/10" />
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            // 🎨 THEME CONTROL: Back Card Glassmorphism
            className="absolute inset-0 bg-[#020617]/50 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.8)] w-full border border-white/10 z-10 backface-hidden rotate-y-180"
          >
            <h1 className="mb-2 text-3xl font-extrabold tracking-widest text-center text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
              Senior Sendoff '26
            </h1>
            <p className="mb-8 font-medium text-center text-cyan-100/70">
              Enter your details to claim your invite!
            </p>

            {error && (
              <div className="p-3 mb-4 text-sm font-semibold text-center text-red-200 border rounded-lg bg-red-500/20 border-red-500/50">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-bold tracking-wider text-cyan-200/80">FULL NAME</label>
                {/* 🎨 THEME CONTROL: Inputs */}
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 font-bold tracking-wide text-white placeholder-gray-500 uppercase transition-all border rounded-xl bg-black/40 border-white/10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="E.G. ALICE"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-bold tracking-wider text-cyan-200/80">USN</label>
                <input
                  type="text"
                  required
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 font-bold tracking-wide text-white placeholder-gray-500 uppercase transition-all border rounded-xl bg-black/40 border-white/10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="E.G. 4JN2*AI***"
                />
              </div>

              {/* 🎨 THEME CONTROL: Login Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-gray-900 font-extrabold text-lg rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Unlock Invitation</span>
                <KeyRound size={22} className="text-gray-900 shrink-0" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}