import React, { useEffect, useState, useContext, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { LogOut, CheckCircle2, AlertTriangle, Search, UserCheck } from "lucide-react";

export default function Scanner() {
  const { logout } = useContext(AuthContext);
  
  const [guestsList, setGuestsList] = useState([]);
  const [scannedUser, setScannedUser] = useState(null);
  const [scanError, setScanError] = useState("");
  const [flashScreen, setFlashScreen] = useState(false);
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  
  // 🔍 Fast-Pass Search State
  const [searchQuery, setSearchQuery] = useState("");
  
  const isProcessingRef = useRef(false);

  // 1. PRE-FETCH THE DATABASE ONCE FOR INSTANT LOOKUPS
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "guests"));
        setGuestsList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Failed to load guest cache", error);
      }
    };
    fetchGuests();
  }, []);

  // 2. CONFIGURE THE CAMERA STREAM ENGINE
  useEffect(() => {
    if (guestsList.length === 0) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 20,
        qrbox: { width: 280, height: 280 },
        rememberLastUsedCamera: true,
        videoConstraints: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment",
          advanced: [{ zoom: 2.0 }]
        },
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Google Drive Link Processing
      let searchToken = decodedText.toUpperCase();
      if (decodedText.includes("drive.google.com")) {
        const match = decodedText.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          searchToken = match[1];
        }
      }

      const matchedUser = guestsList.find(g => 
        g.usn.toUpperCase() === searchToken || 
        (g.invitationImage && g.invitationImage.includes(searchToken)) ||
        (g.QRImg && g.QRImg.includes(searchToken))
      );

      if (matchedUser) {
        triggerAutoCheckIn(matchedUser);
      } else {
        setScanError("Unrecognized QR Code!");
        if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
        setTimeout(() => {
          setScanError("");
          isProcessingRef.current = false;
        }, 2000);
      }
    }

    function onScanError(err) {}

    return () => {
      scanner.clear().catch((e) => console.error("Scanner cleanup error", e));
    };
  }, [guestsList]);

  // 3. REUSABLE AUTO CHECK-IN CONTROLLER (ZERO-CLICK ACTION)
  const triggerAutoCheckIn = async (user) => {
    setScannedUser(user);
    setSearchQuery(""); // Clear lookup input on match
    
    if (!user.entered) {
      setAlreadyEntered(false);
      setFlashScreen(true);
      playSuccessBeep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

      await updateDoc(doc(db, "guests", user.id), { entered: true });
      setGuestsList(prev => prev.map(u => u.id === user.id ? { ...u, entered: true } : u));
    } else {
      setAlreadyEntered(true);
      if (navigator.vibrate) navigator.vibrate(500);
    }

    setTimeout(() => {
      setScannedUser(null);
      setFlashScreen(false);
      setAlreadyEntered(false);
      isProcessingRef.current = false;
    }, 2500);
  };

  const playSuccessBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // 🔍 Filter guest list based on typing input
  const filteredGuests = searchQuery
    ? guestsList.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.usn.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3) // Only show top 3 results to conserve visual space
    : [];

  return (
    <div className={`flex flex-col items-center min-h-screen px-4 pt-8 pb-32 text-white transition-colors duration-200 ${flashScreen ? 'bg-emerald-500/30' : 'bg-transparent'}`}>
      
      {/* Header Glass Container */}
      <div className="relative z-10 w-full max-w-md flex justify-between items-center mb-6 bg-[#020617]/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
            VIP Scanner
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-cyan-100/60 mt-0.5">AUTO-ENTRY ENGINE</p>
        </div>
        <button onClick={logout} className="flex items-center space-x-1.5 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition">
          <LogOut size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
        </button>
      </div>

      {/* Main Scanner Visual Module */}
      <div className="relative z-10 w-full max-w-md bg-[#020617]/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.15)] overflow-hidden">
        <div id="qr-reader" className="w-full"></div>
      </div>

      {/* 🔍 NEW ADVANCED METHOD: TRANSLUCENT FAST-PASS LOOKUP OVERLAY */}
      <div className="relative z-10 flex flex-col w-full max-w-md mt-6">
        <div className="relative flex items-center w-full">
          <Search size={16} className="absolute left-4 text-cyan-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="QR failed? Type Name or USN here..."
            className="w-full pl-11 pr-4 py-3.5 bg-[#020617]/60 backdrop-blur-md border border-white/10 rounded-xl text-sm font-bold text-white placeholder-cyan-100/30 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
          />
        </div>

        {/* Live Search Popup Overlay Drops */}
        {filteredGuests.length > 0 && (
          <div className="absolute top-[105%] left-0 w-full bg-[#020617]/95 backdrop-blur-lg border border-white/10 rounded-xl mt-1 p-1.5 flex flex-col gap-1 z-30 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
            {filteredGuests.map((guest) => (
              <button
                key={guest.id}
                onClick={() => {
                  if (!isProcessingRef.current) {
                    isProcessingRef.current = true;
                    triggerAutoCheckIn(guest);
                  }
                }}
                className="w-full p-3 flex justify-between items-center rounded-lg bg-white/[0.02] hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 text-left transition-all"
              >
                <div>
                  <div className="text-sm font-extrabold tracking-wide text-white uppercase">{guest.name}</div>
                  <div className="text-[10px] font-black text-cyan-400/70 tracking-widest uppercase mt-0.5">{guest.usn}</div>
                </div>
                {guest.entered ? (
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-widest">In ✓</span>
                ) : (
                  <div className="flex items-center space-x-1 text-cyan-400 font-bold text-xs uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
                    <UserCheck size={14} /> <span>Check In</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {scanError && (
        <div className="relative z-10 w-full max-w-md p-4 mt-6 text-center border bg-red-950/80 border-red-500/50 rounded-xl backdrop-blur-md">
          <p className="font-bold tracking-wider text-red-200 uppercase">{scanError}</p>
        </div>
      )}

      {/* Full-Screen Verification Feedback Frame */}
      {scannedUser && (
        <div className="fixed inset-0 bg-[#090d1a]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          {alreadyEntered ? (
            <div className="flex flex-col items-center mb-6 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              <AlertTriangle size={50} className="mb-2" />
              <h2 className="text-3xl font-black tracking-widest uppercase">Warning</h2>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-6 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <CheckCircle2 size={60} className="mb-2" />
              <h2 className="text-3xl font-black tracking-widest uppercase">Verified</h2>
            </div>
          )}

          <p className="mb-6 text-xl font-extrabold tracking-wide text-center text-white uppercase">
            {scannedUser.name} <br/> 
            <span className="text-sm font-bold tracking-widest text-cyan-400">{scannedUser.usn}</span>
          </p>

          <img
            src={scannedUser.profileImage || scannedUser.invitationImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${scannedUser.name}`}
            alt="Guest"
            className={`w-40 h-40 rounded-full border-4 shadow-2xl object-cover mb-8 ${alreadyEntered ? 'border-amber-500/50' : 'border-emerald-500/50'}`}
          />

          <div className={`w-full max-w-xs py-4 font-extrabold tracking-widest text-center uppercase border rounded-xl shadow-lg ${alreadyEntered ? 'bg-amber-950/50 text-amber-400 border-amber-500/30' : 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'}`}>
            {alreadyEntered ? "⚠️ Already Checked In" : "✅ Access Granted"}
          </div>
        </div>
      )}
    </div>
  );
}