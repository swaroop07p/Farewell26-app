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

  // 🔴 CHANGE THIS NUMBER TO CHANGE TOTAL GROUPS IN THE FUTURE!
  const NUMBER_OF_TEAMS = 5; 

  // Listen to live team updates from everyone
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "teams"), (docSnap) => {
      if (docSnap.exists()) {
        setTeamsData(docSnap.data().teamsArray);
      }
    });
    return () => unsub();
  }, []);

  // Admin Only: Generate Random Teams
  const generateTeams = async () => {
    if (!window.confirm("Generate new random teams? This will overwrite the current teams for everyone!")) return;
    setIsGenerating(true);

    try {
      const snapshot = await getDocs(collection(db, "guests"));
      let allGuests = snapshot.docs.map(d => d.data());

      // Filter out the Admin
      allGuests = allGuests.filter(g => g.usn !== "4JN24AI100");

      // Shuffle the guests array randomly
      for (let i = allGuests.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allGuests[i], allGuests[j]] = [allGuests[j], allGuests[i]];
      }

      // Create empty team arrays
      const newTeams = Array.from({ length: NUMBER_OF_TEAMS }, (_, i) => ({
        name: `Team ${i + 1}`,
        members: []
      }));

      // Distribute guests evenly like dealing a deck of cards
      allGuests.forEach((guest, index) => {
        newTeams[index % NUMBER_OF_TEAMS].members.push(guest);
      });

      // Save to Firebase
      await setDoc(doc(db, "settings", "teams"), { teamsArray: newTeams });
    } catch (error) {
      alert("Error generating teams. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Admin Only: Save New Team Name
  const saveTeamName = async (index) => {
    if (!editNameValue.trim()) return;
    const updatedTeams = [...teamsData];
    updatedTeams[index].name = editNameValue;
    await setDoc(doc(db, "settings", "teams"), { teamsArray: updatedTeams });
    setEditingIndex(null);
  };

  return (
    <div className="min-h-screen pb-28 pt-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10 text-center shadow-lg">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500 mb-2">
            Party Teams
          </h1>
          <p className="text-sm text-gray-300">Find your squad for the events!</p>
        </div>

        {/* Admin Generate Button */}
        {currentUser?.isAdmin && (
          <button 
            onClick={generateTeams}
            disabled={isGenerating}
            className="w-full mb-6 py-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Dices size={24} className={isGenerating ? "animate-spin" : ""} /> 
            <span>{isGenerating ? "Shuffling..." : "Randomize Teams"}</span>
          </button>
        )}

        {/* Teams Display */}
        <div className="space-y-4">
          {teamsData.length === 0 ? (
            <p className="text-center text-gray-400 py-8 bg-black/20 rounded-xl border border-white/5">Teams have not been generated yet.</p>
          ) : (
            teamsData.map((team, index) => (
              <div key={index} className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-md">
                
                {/* Team Header (Editable for Admin) */}
                <div className="bg-linear-to-r from-white/10 to-transparent p-4 flex justify-between items-center border-b border-white/10">
                  {editingIndex === index ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input 
                        type="text" 
                        value={editNameValue} 
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="flex-1 bg-black/50 border border-orange-500/50 rounded px-3 py-1 text-white font-bold focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveTeamName(index)} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500 hover:text-white transition"><Save size={16} /></button>
                      <button onClick={() => setEditingIndex(null)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition"><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h2 className="text-lg font-black text-orange-600 tracking-wide uppercase">{team.name}</h2>
                      {currentUser?.isAdmin && (
                        <button 
                          onClick={() => { setEditingIndex(index); setEditNameValue(team.name); }}
                          className="text-gray-400 hover:text-orange-400 transition"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                  <span className="text-xs font-bold text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full">{team.members.length} Members</span>
                </div>

                {/* Team Members List */}
                <div className="p-4 grid grid-cols-1 gap-2">
                  {team.members.map((member, mIndex) => (
                    <div key={mIndex} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                      <img src={member.invitationImage} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                      <div>
                        <p className="text-sm font-bold text-cyan-400">{member.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{member.usn}</p>
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