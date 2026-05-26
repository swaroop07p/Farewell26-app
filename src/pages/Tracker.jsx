import React, { useState, useEffect, useContext } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { guestsData } from "../data/seedData";
import { CheckCircle2, Circle, UploadCloud, Search, UserCheck, XCircle, AlertTriangle } from "lucide-react";

export default function Tracker() {
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const { currentUser } = useContext(AuthContext);

  // REAL-TIME SYNC: Every phone updates instantly
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "guests"), (snapshot) => {
      const guestsArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      guestsArray.sort((a, b) => a.name.localeCompare(b.name));
      setGuests(guestsArray);
    });
    return () => unsubscribe();
  }, []);

  const openConfirmation = (guest) => {
    if (!currentUser?.isAdmin && !currentUser?.isScanner) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setSelectedGuest(guest);
  };

  const confirmToggleStatus = async (guestId, newStatus) => {
    try {
      await updateDoc(doc(db, "guests", guestId), { entered: newStatus });
      
      if (newStatus === true) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        playSuccessBeep();
      } else {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]); 
      }
      
      setSelectedGuest(null); 
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Network Error. Try again.");
    }
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

  const handleJSONUpload = async () => {
    if (!window.confirm("⚠️ WARNING: This will completely WIPE the current database and replace it with your JSON file. Proceed?")) return;
    try {
      const snapshot = await getDocs(collection(db, "guests"));
      const deletePromises = snapshot.docs.map((document) => deleteDoc(doc(db, "guests", document.id)));
      await Promise.all(deletePromises); 

      const addPromises = guestsData.map((guest) => setDoc(doc(db, "guests", guest.usn), guest));
      await Promise.all(addPromises); 
      alert("Database completely synced and cleaned! 🧹✨");
    } catch (error) {
      alert("Upload failed. Check the console.");
    }
  };

  const totalGuests = guests.length;
  const enteredCount = guests.filter((g) => g.entered).length;

  const filteredGuests = guests.filter((guest) => {
    if (guest.usn === "ADMIN_BOSS_USN" || guest.name === "ADMIN BOSS" || guest.name === "CAMERA") return false;
    return guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || guest.usn.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isGatekeeper = currentUser?.isAdmin || currentUser?.isScanner;

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-8 pb-24 bg-transparent">
      <div className="relative z-10 w-full max-w-md">
        
        {/* Header Stats */}
        <div className="bg-[#020617]/50 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10 text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <h1 className="mb-2 text-2xl font-extrabold tracking-widest text-transparent uppercase bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
            {isGatekeeper ? "Gate Control" : "Live Tracker"}
          </h1>
          <div className="flex justify-center mt-4 space-x-8 text-white">
            <div>
              <p className="text-3xl font-black text-cyan-400">{Math.max(0, totalGuests - 2)}</p>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-cyan-100/60">Total</p>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-400">{enteredCount}</p>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-100/60">Entered</p>
            </div>
          </div>
        </div>

        {/* ADMIN ONLY CONTROLS */}
        {currentUser?.isAdmin && (
          <button
            onClick={handleJSONUpload}
            className="flex items-center justify-center w-full py-3 mb-6 font-bold transition border shadow-md bg-black/40 hover:bg-black/60 text-cyan-400 rounded-xl border-cyan-500/30"
          >
            <UploadCloud size={20} className="mr-2 text-cyan-400" /> Sync JSON Data
          </button>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-cyan-500/50" />
          </div>
          <input
            type="text"
            placeholder="Search Name or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#020617]/60 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-cyan-100/30 focus:outline-none focus:border-cyan-500 transition shadow-lg font-bold tracking-wide"
          />
        </div>

        {/* THE GUEST LIST */}
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <p className="text-center text-cyan-400/50 py-4 bg-[#020617]/50 backdrop-blur-md rounded-xl border border-white/5">No guests found.</p>
          ) : (
            filteredGuests.map((guest) => (
              <button
                key={guest.id}
                onClick={() => openConfirmation(guest)}
                disabled={!isGatekeeper}
                className={`w-full text-left flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                  guest.entered 
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                    : "bg-[#020617]/50 hover:bg-cyan-900/30 border-white/10 hover:border-cyan-500/30 shadow-lg active:scale-[0.98]"
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={guest.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${guest.name}`}
                    alt={guest.name}
                    loading="lazy"
                    className="object-cover w-14 h-14 mr-4 border rounded-full shadow-md border-cyan-500/30 shrink-0"
                  />
                  <div>
                    <p className={`font-extrabold text-base uppercase tracking-wide ${guest.entered ? "text-emerald-400" : "text-white"}`}>{guest.name}</p>
                    <p className="text-[11px] text-cyan-400/70 font-black tracking-widest uppercase mt-0.5">{guest.usn}</p>
                  </div>
                </div>

                <div className={`${guest.entered ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-gray-500"}`}>
                  {guest.entered ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 🛑 MOBILE OPTIMIZED CONFIRMATION MODAL */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-[#0a0f24] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            
            <img
              src={selectedGuest.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedGuest.name}`}
              alt={selectedGuest.name}
              className={`w-24 h-24 rounded-full border-4 shadow-xl object-cover mb-4 ${selectedGuest.entered ? 'border-amber-500/50' : 'border-emerald-500/50'}`}
            />
            
            <h2 className="text-xl font-black tracking-wider text-white uppercase">{selectedGuest.name}</h2>
            <p className="mb-5 text-xs font-bold tracking-widest text-cyan-400">{selectedGuest.usn}</p>

            {selectedGuest.entered ? (
              // UNDO CHECK-IN UI
              <div className="w-full space-y-3">
                <div className="flex items-center justify-center mb-2 space-x-2 text-amber-400">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Guest is already inside</span>
                </div>
                <button
                  onClick={() => confirmToggleStatus(selectedGuest.id, false)}
                  className="w-full py-3.5 font-black tracking-widest uppercase transition border bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-400 rounded-xl text-sm"
                >
                  Undo & Remove Entry
                </button>
              </div>
            ) : (
              // CONFIRM CHECK-IN UI
              <div className="w-full space-y-3">
                <button
                  onClick={() => confirmToggleStatus(selectedGuest.id, true)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl flex items-center justify-center space-x-2 uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] transition active:scale-[0.98] text-sm"
                >
                  <UserCheck size={18} /> <span>Confirm Entry</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedGuest(null)}
              className="flex items-center justify-center w-full py-3 mt-3 space-x-2 text-xs font-bold tracking-widest text-white uppercase transition border bg-white/5 hover:bg-white/10 border-white/10 rounded-xl"
            >
              <XCircle size={16} /> <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
    }
                                                                                  
