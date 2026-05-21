import React, { useEffect, useState, useContext } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
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

    // Initialize the advanced scanner with explicit resolution
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 15, // Bumped up slightly for smoother detection
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        // Add this to force a clearer camera feed
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Forces back camera on mobile
        },
      },
      false,
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      // Pause scanner so it doesn't scan the same code 100 times a second
      scanner.clear();
      setIsScanning(false);
      setScanError("");

      try {
        // Find the user by the USN inside the QR code
        const q = query(
          collection(db, "guests"),
          where("usn", "==", decodedText.toUpperCase()),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setScannedUser({
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
          });
        } else {
          setScanError(`No guest found for USN: ${decodedText}`);
        }
      } catch (error) {
        setScanError("Database error during lookup.");
      }
    }

    function onScanError(err) {
      // Ignore background scan errors, they happen continuously until a QR is found
    }

    // Cleanup scanner when leaving page
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
    setIsScanning(true); // Restart the scanner
  };

  return (
    <div className="min-h-screen text-black flex flex-col items-center pt-8 px-4 pb-24">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            VIP Scanner
          </h1>
          <p className="text-xs font-bold tracking-widest text-white">
            GATE ENTRY MODE
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
        >
          <LogOut size={14} />
          <span className="text-xs font-bold uppercase tracking-wider mt-0.5">
            Exit
          </span>
        </button>
      </div>

      {/* The Camera Feed Window */}
      <div className="w-full max-w-md bg-white p-2 rounded-2xl shadow-2xl overflow-hidden">
        {/* Kept the element mounted, but hidden/shown using class toggles */}
        <div
          id="qr-reader"
          className={`w-full ${!isScanning ? "hidden" : ""}`}
        ></div>

        {!isScanning && (
          <div className="h-[300px] flex items-center justify-center bg-gray-900 text-white font-bold rounded-xl">
            Processing Scan... ⏳
          </div>
        )}
      </div>

      {/* Error Message if QR doesn't match database */}
      {scanError && (
        <div className="w-full max-w-md mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center backdrop-blur-sm">
          <p className="font-bold mb-3">{scanError}</p>
          <button
            onClick={closeModal}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* SUCCESS MODAL: Shows the Invitation Image */}
      {scannedUser && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <h2 className="text-2xl font-black text-green-600 mb-2 uppercase tracking-widest text-center">
            GUEST VERIFIED
          </h2>
          <p className="text-lg font-bold mb-6">
            {scannedUser.name} • {scannedUser.usn}
          </p>

          <img
            src={scannedUser.invitationImage}
            alt="Guest Invitation"
            className="w-full max-w-sm rounded-2xl border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-8 object-cover aspect-[3/4]"
          />

          <div className="flex flex-col w-full max-w-sm space-y-3">
            {/* Awesome feature: Mark them present straight from the scanner! */}
            {!scannedUser.entered ? (
              <button
                onClick={markAsEntered}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center space-x-2 text-lg"
              >
                <UserCheck size={24} /> <span>Grant Entry & Check In</span>
              </button>
            ) : (
              <div className="w-full py-4 bg-gray-100 text-green-600 font-extrabold rounded-xl text-center border border-green-500/30">
                ✅ Already Checked In
              </div>
            )}

            <button
              onClick={closeModal}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 font-bold rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <XCircle size={20} /> <span>Close & Scan Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}