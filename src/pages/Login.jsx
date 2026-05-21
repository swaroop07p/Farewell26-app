import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import confetti from "canvas-confetti";
import PartyEffect from "../components/PartyEffect";
import { KeyRound } from "lucide-react";

export default function Login() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [error, setError] = useState("");
  const [showBalloons, setShowBalloons] = useState(false);

  // NEW
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

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          "#ff0a54",
          "#ff477e",
          "#ff7096",
          "#ff85a1",
          "#fbb1bd",
        ],
      });

      setTimeout(() => {
        navigate("/home");
      }, 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {showBalloons}
      {/*  && <PartyEffect /> */}

      {/* FLIP CONTAINER */}
      <div
        className="w-full max-w-md h-110"
        style={{ perspective: "1500px" }}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT SIDE */}
          <div
            className="absolute inset-0 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border-3 border-red-800 z-10 flex flex-col items-center justify-center cursor-pointer"
            style={{
              backfaceVisibility: "hidden",
            }}
            onClick={() => setIsFlipped(true)}
          >
            <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
            The Grand Send-Off: Celebrating Our Seniors
            </h1>

            <p className="text-purple-200 text-center mb-8 font-medium">
              Tap to Unlock Your Invitation
            </p>

            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-xl animate-pulse">
              <KeyRound
                size={40}
                className="text-amber-300 fill-amber-400/10"
              />
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className="absolute inset-0 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full border-3 border-red-800 z-10"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <h1 className="text-3xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
              Senior Sendoff '26
            </h1>

            <p className="text-purple-200 text-center mb-8 font-medium">
              Enter your details to claim your invite!
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-center mb-4 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-1">
                  FULL NAME
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value.toUpperCase())
                  }
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold uppercase tracking-wide"
                  placeholder="E.G. ALICE"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-200 mb-1">
                  USN
                </label>

                <input
                  type="text"
                  required
                  value={usn}
                  onChange={(e) =>
                    setUsn(e.target.value.toUpperCase())
                  }
                  className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold uppercase tracking-wide"
                  placeholder="E.G. 4JN2*AI***"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-pink-600 text-white font-extrabold text-lg rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)] transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Unlock Invitation</span>

                <KeyRound
                  size={25}
                  className="text-amber-300 fill-amber-400/10 shrink-0"
                />
              </button>
            </form>

            {/* FLIP BACK BUTTON */}
            {/* <button
              onClick={() => setIsFlipped(false)}
              className="w-full mt-4 text-sm text-purple-200 hover:text-white transition"
            >
              ← Back
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}