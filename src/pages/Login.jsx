import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import confetti from "canvas-confetti";
import PartyEffect from "../components/PartyEffect";

export default function Login() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [error, setError] = useState("");
  const [showBalloons, setShowBalloons] = useState(false);
  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate("/home");
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // We already ensure it's uppercase, but we run it through upperCase again just in case
    const result = await login(name.toUpperCase(), usn);

    // if (result.success) {
    //   confetti({
    //     particleCount: 150,
    //     spread: 70,
    //     origin: { y: 0.6 },
    //     colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd']
    //   });

    // //   setShowBalloons(true);

    //   // Give the balloons 3 full seconds to fly off the top of the screen!
    //   setTimeout(() => {
    //     navigate('/home');
    //   }, 3000);
    // } else {
    //   setError(result.message);
    // }

    if (result.success) {
      // Fire off the visual celebration canvas pop instantly on the login layout
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1bd"],
      });

      // Jump immediately to the dashboard where the streamers will elegantly roll down!
      navigate("/home");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {showBalloons}
      {/*  && <PartyEffect /> */}

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 z-10">
        <h1 className="text-3xl font-extrabold text-white text-center mb-2">
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
              // This instantly turns their typing into capital letters!
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold uppercase tracking-wide"
              placeholder="E.G. JOHN DOE"
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
              onChange={(e) => setUsn(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold uppercase tracking-wide"
              placeholder="E.G. 4JN22CS001"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-lg rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)] transform transition hover:scale-[1.02] active:scale-95"
          >
            Unlock Invitation 🔑
          </button>
        </form>
      </div>
    </div>
  );
}
