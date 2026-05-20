import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
import { guestsData } from '../data/seedData';
import { CheckCircle2, Circle, UploadCloud, Search } from 'lucide-react';

export default function Tracker() {
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "guests"), (snapshot) => {
      const guestsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      guestsArray.sort((a, b) => a.name.localeCompare(b.name));
      setGuests(guestsArray);
    });

    return () => unsubscribe(); 
  }, []);

  const toggleEntry = async (guestId, currentStatus) => {
    if (!currentUser.isAdmin) return;
    try {
      const guestRef = doc(db, "guests", guestId);
      await updateDoc(guestRef, { entered: !currentStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleJSONUpload = async () => {
    if (!window.confirm("Upload JSON to database? This will overwrite existing guest details!")) return;
    try {
      for (const guest of guestsData) {
        await setDoc(doc(db, "guests", guest.usn), guest); 
      }
      alert("Database updated from JSON! 🎉");
    } catch (error) {
      alert("Upload failed. Check console.");
    }
  };

  const totalGuests = guests.length;
  const enteredCount = guests.filter(g => g.entered).length;

  // Search Logic!
  const filteredGuests = guests.filter((guest) => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    guest.usn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Header Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10 text-center shadow-lg">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            Live Entry Tracker
          </h1>
          <div className="flex justify-center space-x-8 text-white mt-4">
            <div>
              <p className="text-3xl font-bold">{totalGuests}</p>
              <p className="text-xs text-purple-300 uppercase tracking-wide font-bold">Total</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{enteredCount}</p>
              <p className="text-xs text-purple-300 uppercase tracking-wide font-bold">Entered</p>
            </div>
          </div>
        </div>

        {/* Admin Upload Button */}
        {currentUser?.isAdmin && (
          <button 
            onClick={handleJSONUpload}
            className="w-full mb-6 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white py-3 rounded-xl border border-white/10 transition shadow-md font-bold"
          >
            <UploadCloud size={20} className="mr-2 text-blue-400" />
            Sync JSON Data
          </button>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Name or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          />
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No guests found.</p>
          ) : (
            filteredGuests.map((guest) => (
              <div 
                key={guest.id} 
                className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm ${guest.entered ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-black/20 border-white/10'} transition-all duration-300`}
              >
                <div className="flex items-center">
                  <img 
                    src={guest.invitationImage} 
                    alt={guest.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50 mr-4 shadow-md"
                  />
                  <div>
                    <p className="text-white font-bold">{guest.name}</p>
                    <p className="text-xs text-purple-300 font-medium tracking-wide">{guest.usn}</p>
                  </div>
                </div>

                {currentUser?.isAdmin ? (
                  <button 
                    onClick={() => toggleEntry(guest.id, guest.entered)}
                    className={`p-2 rounded-full transition-transform active:scale-90 ${guest.entered ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'text-gray-500 hover:text-white'}`}
                  >
                    {guest.entered ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                  </button>
                ) : (
                  <div className={`${guest.entered ? 'text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'text-gray-500'}`}>
                     {guest.entered ? <CheckCircle2 size={28} /> : <span className="text-[10px] font-bold px-2 py-1 bg-black/50 border border-white/10 rounded uppercase tracking-wider text-gray-400">Waiting</span>}
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