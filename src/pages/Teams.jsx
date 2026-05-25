import React, { useState, useEffect, useContext } from 'react';
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AuthContext } from '../context/AuthContext';
import { Edit2, Dices, Save, X, Trash2, Copy, Users } from 'lucide-react';

export default function Teams() {
  const { currentUser } = useContext(AuthContext);
  const [teamsData, setTeamsData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");
  
  // ⚙️ NEW ADMIN TOOL: Dynamic Team Size Controller
  const [teamSize, setTeamSize] = useState(6);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "teams"), (docSnap) => {
      if (docSnap.exists()) {
        setTeamsData(docSnap.data().teamsArray || []);
      }
    });
    return () => unsub();
  }, []);

  // 🎲 CORE UPGRADE: Smart Randomizer (Only Present Guests)
  const generateTeams = async () => {
    if (teamsData.length > 0) {
      if (!window.confirm("⚠️ WARNING: This will OVERWRITE the current teams for everyone! Are you sure you want to re-shuffle?")) return;
    }
    setIsGenerating(true);

    try {
      const snapshot = await getDocs(collection(db, "guests"));
      
      // 🛡️ FILTER: Only pull guests who have actually entered the venue!
      let presentGuests = snapshot.docs.map(d => d.data()).filter(g => 
        g.usn !== "4JN24AI100" && // Exclude Admin Boss
        g.usn !== "4JN24AI101" && // Exclude Camera Team
        g.entered === true        // MUST BE CHECKED IN
      );

      if (presentGuests.length === 0) {
        alert("❌ No guests have checked in yet! You cannot generate teams until people arrive.");
        setIsGenerating(false);
        return;
      }

      // Shuffle the present guests using Fisher-Yates
      for (let i = presentGuests.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [presentGuests[i], presentGuests[j]] = [presentGuests[j], presentGuests[i]];
      }

      // Calculate how many teams we need based on the Admin's chosen team size
      const numberOfTeamsToMake = Math.ceil(presentGuests.length / teamSize);
      
      const newTeams = Array.from({ length: numberOfTeamsToMake }, (_, i) => ({
        name: `Squad ${i + 1}`,
        members: []
      }));

      // Distribute evenly
      presentGuests.forEach((guest, index) => {
        newTeams[index % numberOfTeamsToMake].members.push(guest);
      });

      await setDoc(doc(db, "settings", "teams"), { teamsArray: newTeams });
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Success vibration
      
    } catch (error) {
      console.error(error);
      alert("Error generating teams. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 🧹 NEW ADMIN TOOL: Clear all teams
  const clearTeams = async () => {
    if (!window.confirm("⚠️ EXTREME DANGER: Are you sure you want to DELETE all teams? This cannot be undone!")) return;
    try {
      await setDoc(doc(db, "settings", "teams"), { teamsArray: [] });
      if (navigator.vibrate) navigator.vibrate(200);
    } catch (error) {
      alert("Failed to clear teams.");
    }
  };

  // 📋 NEW ADMIN TOOL: Export to WhatsApp/Clipboard
  const copyTeamsToClipboard = () => {
    if (teamsData.length === 0) return alert("No teams to copy!");
    
    let textStr = "🎉 *FAREWELL PARTY TEAMS* 🎉\n\n";
    teamsData.forEach((team) => {
      textStr += `🔥 *${team.name}* (${team.members.length} Members)\n`;
      team.members.forEach((m) => {
        textStr += `  • ${m.name}\n`;
      });
      textStr += "\n";
    });

    navigator.clipboard.writeText(textStr);
    alert("✅ Teams copied to clipboard! Ready to paste into WhatsApp.");
  };

  const saveTeamName = async (index) => {
    if (!editNameValue.trim()) return;
    const updatedTeams = [...teamsData];
    updatedTeams[index].name = editNameValue;
    await setDoc(doc(db, "settings", "teams"), { teamsArray: updatedTeams });
    setEditingIndex(null);
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-8 bg-transparent pb-28">
      <div className="relative z-10 w-full max-w-md">
        
        {/* Header */}
        <div className="bg-[#020617]/50 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10 text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <h1 className="mb-2 text-2xl font-extrabold tracking-widest text-transparent uppercase bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
            Party Teams
          </h1>
          <p className="text-sm font-medium tracking-wide text-cyan-100/70">Find your squad for the events!</p>
        </div>

        {/* 🛠️ ADMIN COMMAND CENTER */}
        {currentUser?.isAdmin && (
          <div className="p-5 mb-8 border shadow-xl bg-black/40 backdrop-blur-md rounded-2xl border-cyan-500/30">
            <h3 className="mb-4 text-xs font-black tracking-widest text-center uppercase text-cyan-400/80">Admin Tools</h3>
            
            {/* Team Size Controller */}
            <div className="flex items-center justify-between mb-5 bg-[#020617]/60 p-3 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-cyan-100">
                <Users size={18} />
                <span className="text-sm font-bold tracking-wider uppercase">Max Team Size</span>
              </div>
              <input 
                type="number" 
                min="2" 
                max="20"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-16 px-2 py-1 text-lg font-black text-center text-white bg-black border rounded-lg border-cyan-500/50 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Action Buttons */}
            <button 
              onClick={generateTeams}
              disabled={isGenerating}
              className="w-full mb-3 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-gray-900 font-black tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center space-x-2 transition disabled:opacity-50 active:scale-[0.98]"
            >
              <Dices size={20} className={isGenerating ? "animate-spin" : ""} /> 
              <span>{isGenerating ? "Shuffling..." : "Randomize Teams"}</span>
            </button>

            <div className="flex space-x-3">
              <button 
                onClick={copyTeamsToClipboard}
                className="flex items-center justify-center w-1/2 py-3 space-x-2 text-xs font-bold tracking-widest text-white uppercase transition border rounded-xl bg-white/5 hover:bg-white/10 border-white/10"
              >
                <Copy size={16} /> <span>Export List</span>
              </button>
              
              <button 
                onClick={clearTeams}
                className="flex items-center justify-center w-1/2 py-3 space-x-2 text-xs font-bold tracking-widest text-red-400 uppercase transition border rounded-xl bg-red-500/10 hover:bg-red-500/20 border-red-500/30"
              >
                <Trash2 size={16} /> <span>Clear All</span>
              </button>
            </div>
          </div>
        )}

        {/* Teams Display List */}
        <div className="space-y-5">
          {teamsData.length === 0 ? (
            <div className="py-8 text-center border shadow-lg bg-[#020617]/50 backdrop-blur-md rounded-2xl border-white/5 flex flex-col items-center justify-center">
              <Dices size={40} className="mb-3 text-cyan-500/30" />
              <p className="font-bold tracking-wider text-cyan-400/50">Teams have not been generated yet.</p>
            </div>
          ) : (
            teamsData.map((team, index) => (
              <div key={index} className="bg-[#020617]/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5 duration-300">
                
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
                  <span className="px-3 py-1 text-xs font-black tracking-widest uppercase border rounded-full text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                    {team.members.length} Members
                  </span>
                </div>

                {/* Team Members List */}
                <div className="grid grid-cols-1 gap-2 p-4">
                  {team.members.map((member, mIndex) => (
                    <div key={mIndex} className="flex items-center p-3 transition border rounded-xl bg-white/5 hover:bg-white/10 border-white/5">
                      <img 
                        src={member.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`} 
                        alt={member.name} 
                        loading="lazy"
                        decoding="async"
                        className="object-cover w-12 h-12 mr-4 border rounded-full shadow-md border-cyan-500/30 shrink-0" 
                      />
                      <div>
                        <p className="text-sm font-extrabold tracking-wide text-white uppercase">{member.name}</p>
                        <p className="text-[10px] text-cyan-400/70 font-black uppercase tracking-widest mt-0.5">{member.usn}</p>
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