import React, { useEffect, useState, useContext } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { AuthContext } from "../context/AuthContext";
import { LogOut, UserCheck, XCircle } from "lucide-react";

export default function Scanner() {
  const { logout } = useContext(AuthContext);
  const [scannedUser, setScannedUser] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        videoConstraints: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
      },
      false,
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      scanner.clear();
      setIsScanning(false);
      setScanError("");

      try {
        const q = query(collection(db, "guests"), where("usn", "==", decodedText.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setScannedUser({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        } else {
          setScanError(`No guest found for USN: ${decodedText}`);
        }
      } catch (error) {
        setScanError("Database error during lookup.");
      }
    }

    function onScanError(err) {}

    return () => {
      scanner.clear().catch((e) => console.error("Scanner cleanup error", e));
    };
  }, [isScanning]);

  const markAsEntered = async () => {
    if (!scannedUser) return;
    await updateDoc(doc(db, "guests", scannedUser.id), { entered: true });
    closeModal();
  };

  const closeModal = () => {
    setScannedUser(null);
    setScanError("");
    setIsScanning(true);
  };

  return (
    // 🎨 THEME CONTROL: bg-transparent wrapper
    <div className="flex flex-col items-center min-h-screen px-4 pt-8 pb-24 text-white bg-transparent">
      
      {/* 🎨 THEME CONTROL: Header Glassmorphism */}
      <div className="relative z-10 w-full max-w-md flex justify-between items-center mb-6 bg-[#020617]/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
            VIP Scanner
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-cyan-100/60 mt-0.5">GATE ENTRY MODE</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm"
        >
          <LogOut size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
        </button>
      </div>

      {/* 🎨 THEME CONTROL: Scanner Box Dark View */}
      <div className="relative z-10 w-full max-w-md bg-[#020617]/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.15)] overflow-hidden">
        <div id="qr-reader" className={`w-full ${!isScanning ? "hidden" : ""}`}></div>
        {!isScanning && (
          <div className="flex items-center justify-center font-bold tracking-widest uppercase border h-75 bg-black/60 text-cyan-400 rounded-xl border-white/5">
            Processing Scan... ⏳
          </div>
        )}
      </div>

      {scanError && (
        <div className="relative z-10 w-full max-w-md p-4 mt-6 text-center border shadow-2xl bg-red-950/80 border-red-500/50 rounded-xl backdrop-blur-md">
          <p className="mb-4 font-bold text-red-200">{scanError}</p>
          <button onClick={closeModal} className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black tracking-widest uppercase transition shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            Try Again
          </button>
        </div>
      )}

      {/* 🎨 THEME CONTROL: SUCCESS MODAL Popup */}
      {scannedUser && (
        <div className="fixed inset-0 bg-[#090d1a]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-black text-emerald-400 mb-2 uppercase tracking-widest text-center drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            GUEST VERIFIED
          </h2>
          <p className="mb-8 text-lg font-bold tracking-wide text-white">
            {scannedUser.name} <span className="mx-2 text-cyan-500">•</span> <span className="text-sm text-cyan-100/70">{scannedUser.usn}</span>
          </p>

          <img
            src={scannedUser.invitationImage}
            alt="Guest Invitation"
            className="w-full max-w-xs rounded-2xl border-4 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-10 object-cover aspect-3/4"
          />

          <div className="flex flex-col w-full max-w-xs space-y-4">
            {!scannedUser.entered ? (
              <button
                onClick={markAsEntered}
                className="w-full py-4 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 text-lg uppercase tracking-wide transition transform hover:scale-[1.02] active:scale-95"
              >
                <UserCheck size={24} /> <span>Grant Entry</span>
              </button>
            ) : (
              <div className="w-full py-4 font-extrabold tracking-widest text-center uppercase border bg-emerald-950/50 text-emerald-400 rounded-xl border-emerald-500/30">
                ✅ Already Checked In
              </div>
            )}

            <button
              onClick={closeModal}
              className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl flex items-center justify-center space-x-2 transition uppercase tracking-widest text-sm"
            >
              <XCircle size={18} /> <span>Close & Scan Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}