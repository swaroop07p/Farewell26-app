import React, { useEffect, useState, useContext, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { LogOut, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Scanner() {
  const { logout } = useContext(AuthContext);
  
  const [guestsList, setGuestsList] = useState([]);
  const [scannedUser, setScannedUser] = useState(null);
  const [scanError, setScanError] = useState("");
  const [flashScreen, setFlashScreen] = useState(false);
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  
  // Ref lock to prevent the camera from firing 30 times a second on the same QR
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

  // 2. CONFIGURE THE SNIPER CAMERA ENGINE
  useEffect(() => {
    if (guestsList.length === 0) return; // Wait until cache is loaded

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 20, // Aggressive high-speed frame sampling
        qrbox: { width: 280, height: 280 }, // Restrict scanner to the center to ignore background noise
        rememberLastUsedCamera: true,
        videoConstraints: {
          width: { ideal: 1920 }, // Force 1080p if available
          height: { ideal: 1080 },
          facingMode: "environment",
          advanced: [{ zoom: 2.0 }] // Attempt to force 2x zoom to enlarge dense pixels
        },
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      // If we are currently processing a scan, ignore everything else
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // 3. THE GOOGLE DRIVE URL PARSER
      let searchToken = decodedText.toUpperCase();
      
      // If it's a Drive link, extract just the unique File ID string
      if (decodedText.includes("drive.google.com")) {
        const match = decodedText.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          searchToken = match[1];
        }
      }

      // Find the guest in our pre-loaded cache
      const matchedUser = guestsList.find(g => 
        g.usn.toUpperCase() === searchToken || 
        (g.invitationImage && g.invitationImage.includes(searchToken)) ||
        (g.QRImg && g.QRImg.includes(searchToken))
      );

      if (matchedUser) {
        setScannedUser(matchedUser);
        
        // 4. ZERO-CLICK AUTO-UPDATE
        if (!matchedUser.entered) {
          setAlreadyEntered(false);
          setFlashScreen(true); // Trigger Green Screen
          playSuccessBeep();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

          // Fire the update to Firebase in the background
          await updateDoc(doc(db, "guests", matchedUser.id), { entered: true });
          
          // Update local cache so we know they are inside
          setGuestsList(prev => prev.map(u => u.id === matchedUser.id ? { ...u, entered: true } : u));
        } else {
          // They already scanned in previously!
          setAlreadyEntered(true);
          if (navigator.vibrate) navigator.vibrate(500); // Long vibrate for warning
        }

        // 5. AUTO-RESET COOLDOWN BUFFER (2.5 Seconds)
        setTimeout(() => {
          setScannedUser(null);
          setFlashScreen(false);
          setAlreadyEntered(false);
          isProcessingRef.current = false; // Unlock scanner
        }, 2500);

      } else {
        // Unknown Code Scanned
        setScanError("Unrecognized QR Code!");
        if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
        
        setTimeout(() => {
          setScanError("");
          isProcessingRef.current = false;
        }, 2000);
      }
    }

    function onScanError(err) {
      // Ignored: The scanner throws errors every frame it *doesn't* see a code.
    }

    return () => {
      scanner.clear().catch((e) => console.error("Scanner cleanup error", e));
    };
  }, [guestsList]); // Re-initialize only when guest list loads

  // Generic Web Audio API Beep Generator (No MP3 file needed!)
  const playSuccessBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15); // Short snappy beep
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  return (
    // 🎨 THEME CONTROL: The flashScreen state dynamically overrides the background!
    <div className={`flex flex-col items-center min-h-screen px-4 pt-8 pb-24 text-white transition-colors duration-200 ${flashScreen ? 'bg-emerald-500/30' : 'bg-transparent'}`}>
      
      {/* Header Glassmorphism */}
      <div className="relative z-10 w-full max-w-md flex justify-between items-center mb-6 bg-[#020617]/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
            VIP Scanner
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-cyan-100/60 mt-0.5">AUTO-ENTRY MODE</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm"
        >
          <LogOut size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
        </button>
      </div>

      {/* Scanner Box Target */}
      <div className="relative z-10 w-full max-w-md bg-[#020617]/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.15)] overflow-hidden">
        <div id="qr-reader" className="w-full"></div>
      </div>

      {/* Error Popup */}
      {scanError && (
        <div className="relative z-10 w-full max-w-md p-4 mt-6 text-center border shadow-2xl bg-red-950/80 border-red-500/50 rounded-xl backdrop-blur-md">
          <p className="font-bold tracking-wider text-red-200 uppercase">{scanError}</p>
        </div>
      )}

      {/* 🎨 THEME CONTROL: HANDS-FREE SUCCESS MODAL */}
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