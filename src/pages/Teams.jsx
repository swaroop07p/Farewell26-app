import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
import { Edit2, Dices, Save, X } from 'lucide-react';

export default function Teams() {
  const { currentUser } = useContext(AuthContext);
  const [teamsData, setTeamsData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");

  const NUMBER_OF_TEAMS = 5; 

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "teams"), (docSnap) => {
      if (docSnap.exists()) {
        setTeamsData(docSnap.data().teamsArray);
      }
    });
    return () => unsub();
  }, []);

  const generateTeams = async () => {
    if (!window.confirm("Generate new random teams? This will overwrite the current teams for everyone!")) return;
    setIsGenerating(true);

    try {
      const snapshot = await getDocs(collection(db, "guests"));
      let allGuests = snapshot.docs.map(d => d.data());
      allGuests = allGuests.filter(g => g.usn !== "4JN24AI100");

      for (let i = allGuests.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allGuests[i], allGuests[j]] = [allGuests[j], allGuests[i]];
      }

      const newTeams = Array.from({ length: NUMBER_OF_TEAMS }, (_, i) => ({
        name: `Team ${i + 1}`,
        members: []
      }));

      allGuests.forEach((guest, index) => {
        newTeams[index % NUMBER_OF_TEAMS].members.push(guest);
      });

      await setDoc(doc(db, "settings", "teams"), { teamsArray: newTeams });
    } catch (error) {
      alert("Error generating teams. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTeamName = async (index) => {
    if (!editNameValue.trim()) return;
    const updatedTeams = [...teamsData];
    updatedTeams[index].name = editNameValue;
    await setDoc(doc(db, "settings", "teams"), { teamsArray: updatedTeams });
    setEditingIndex(null);
  };

  return (
    // 🎨 THEME CONTROL: Notice bg-transparent here so the global blobs show through!
    <div className="flex flex-col items-center min-h-screen px-4 pt-8 bg-transparent pb-28">
      <div className="relative z-10 w-full max-w-md">
        
        {/* Glassmorphism Header */}
        <div className="bg-[#020617]/50 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10 text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          {/* 🎨 THEME CONTROL: Cyan/Emerald Text Gradient */}
          <h1 className="mb-2 text-2xl font-extrabold tracking-widest text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
            Party Teams
          </h1>
          <p className="text-sm font-medium tracking-wide text-cyan-100/70">Find your squad for the events!</p>
        </div>

        {/* Admin Generate Button */}
        {currentUser?.isAdmin && (
          <button 
            onClick={generateTeams}
            disabled={isGenerating}
            // 🎨 THEME CONTROL: Cyan/Emerald Button
            className="w-full mb-6 py-4 bg-linear-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-400 text-gray-900 font-extrabold rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Dices size={24} className={isGenerating ? "animate-spin" : ""} /> 
            <span>{isGenerating ? "Shuffling..." : "Randomize Teams"}</span>
          </button>
        )}

        {/* Teams Display */}
        <div className="space-y-5">
          {teamsData.length === 0 ? (
            <p className="text-center text-cyan-400/50 py-8 bg-[#020617]/50 backdrop-blur-md rounded-xl border border-white/5">Teams have not been generated yet.</p>
          ) : (
            teamsData.map((team, index) => (
              <div key={index} className="bg-[#020617]/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                
                {/* Team Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-cyan-500/10 to-transparent border-white/10">
                  {editingIndex === index ? (
                    <div className="flex items-center w-full space-x-2">
                      <input 
                        type="text" 
                        value={editNameValue} 
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="flex-1 px-3 py-1 font-bold text-white border rounded bg-black/60 border-cyan-500/50 focus:outline-none focus:border-cyan-400"
                        autoFocus
                      />
                      <button onClick={() => saveTeamName(index)} className="p-2 transition rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"><Save size={16} /></button>
                      <button onClick={() => setEditingIndex(null)} className="p-2 text-red-400 transition rounded bg-red-500/20 hover:bg-red-500 hover:text-white"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-black text-cyan-400 tracking-wide uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">{team.name}</h2>
                      {currentUser?.isAdmin && (
                        <button 
                          onClick={() => { setEditingIndex(index); setEditNameValue(team.name); }}
                          className="text-gray-400 transition hover:text-cyan-400"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                  <span className="px-2 py-1 text-xs font-bold border rounded-full text-emerald-100 bg-emerald-500/30 border-emerald-500/30">{team.members.length} Members</span>
                </div>

                {/* Team Members List */}
                <div className="grid grid-cols-1 gap-2 p-4">
                  {team.members.map((member, mIndex) => (
                    <div key={mIndex} className="flex items-center p-2 space-x-3 transition border rounded-lg bg-white/5 hover:bg-white/10 border-white/5">
                      {/* 🛡️ THE PROFILE IMAGE AVATAR MOUNT: 
                          Swapped invitationImage for profileImage, safely using a backup seed vector if missing */}
                      <img 
                        src={member.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`} 
                        alt={member.name} 
                        className="object-cover border rounded-full shadow-md w-9 h-9 border-cyan-500/20" 
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{member.name}</p>
                        <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest">{member.usn}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}