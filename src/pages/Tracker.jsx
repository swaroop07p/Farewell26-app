import React, { useState, useEffect, useContext } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { guestsData } from "../data/seedData";
import { CheckCircle2, Circle, UploadCloud, Search } from "lucide-react";

export default function Tracker() {
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "guests"), (snapshot) => {
      const guestsArray = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      guestsArray.sort((a, b) => a.name.localeCompare(b.name));
      setGuests(guestsArray);
    });
    return () => unsubscribe();
  }, []);

  const toggleEntry = async (guestId, currentStatus) => {
    if (!currentUser.isAdmin) return;
    try {
      await updateDoc(doc(db, "guests", guestId), { entered: !currentStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
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
    if (guest.usn === "ADMIN_BOSS_USN" || guest.name === "ADMIN BOSS") return false;
    return guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || guest.usn.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    // 🎨 THEME CONTROL: bg-transparent wrapper
    <div className="flex flex-col items-center min-h-screen px-4 pt-8 pb-24 bg-transparent">
      <div className="relative z-10 w-full max-w-md">
        
        {/* 🎨 THEME CONTROL: Header Stats Glassmorphism */}
        <div className="bg-[#020617]/50 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10 text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <h1 className="mb-2 text-2xl font-extrabold tracking-widest text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
            Live Entry Tracker
          </h1>
          <div className="flex justify-center mt-4 space-x-8 text-white">
            <div>
              <p className="text-3xl font-black text-cyan-400">{totalGuests-1}</p>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-cyan-100/60">Total</p>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-400">{enteredCount}</p>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-100/60">Entered</p>
            </div>
          </div>
        </div>

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
            placeholder="Search by Name or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // 🎨 THEME CONTROL: Search Bar
            className="w-full pl-12 pr-4 py-3.5 bg-[#020617]/60 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-lg font-medium tracking-wide"
          />
        </div>

        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <p className="text-center text-cyan-400/50 py-4 bg-[#020617]/50 backdrop-blur-md rounded-xl border border-white/5">No guests found.</p>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                // 🎨 THEME CONTROL: Guest Card Active States
                className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                  guest.entered 
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                    : "bg-[#020617]/50 border-white/10 shadow-lg"
                }`}
              >
                <div className="flex items-center">
                  {/* 🛡️ THE PROFILE IMAGE AVATAR MOUNT: 
                      Points cleanly to guest.profileImage, falling back securely to an auto-seed bot vector if missing */}
                  <img
                    src={guest.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${guest.name}`}
                    alt={guest.name}
                    className="object-cover w-12 h-12 mr-4 border rounded-full shadow-md border-cyan-500/30"
                  />
                  <div>
                    <p className={`font-extrabold ${guest.entered ? "text-emerald-400" : "text-white"}`}>{guest.name}</p>
                    <p className="text-[10px] text-cyan-100/60 font-bold tracking-widest uppercase mt-0.5">{guest.usn}</p>
                  </div>
                </div>

                {currentUser?.isAdmin ? (
                  <button
                    onClick={() => toggleEntry(guest.id, guest.entered)}
                    className={`p-2 rounded-full transition-transform active:scale-90 ${
                      guest.entered ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "text-gray-500 hover:text-cyan-400"
                    }`}
                  >
                    {guest.entered ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                  </button>
                ) : (
                  <div className={`${guest.entered ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-gray-500"}`}>
                    {guest.entered ? <CheckCircle2 size={28} /> : <span className="text-[10px] font-bold px-2.5 py-1 bg-black/50 border border-white/10 rounded uppercase tracking-widest text-cyan-100/50">Waiting</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}