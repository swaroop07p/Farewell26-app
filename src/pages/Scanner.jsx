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

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.777778,
        videoConstraints: {
          facingMode: "environment",
        },
      },
      false,
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText) {
      try {
        // Stop scanner after successful scan
        await scanner.clear();

        setIsScanning(false);
        setScanError("");

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
        console.error(error);
        setScanError("Database error during lookup.");
      }
    }

    function onScanError() {
      // Ignore scan errors
    }

    return () => {
      scanner
        .clear()
        .catch((err) => console.log("Scanner cleanup warning:", err));
    };
  }, [isScanning]);

  const markAsEntered = async () => {
    if (!scannedUser) return;

    await updateDoc(doc(db, "guests", scannedUser.id), {
      entered: true,
    });

    closeModal();
  };

  const closeModal = () => {
    setScannedUser(null);
    setScanError("");
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-[#2d0b59] flex flex-col items-center pt-8 px-4 pb-24">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            VIP Scanner
          </h1>

          <p className="text-gray-200 text-sm font-bold tracking-[3px] uppercase">
            Gate Entry Mode
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut size={16} />
          <span className="font-bold uppercase text-sm">Exit</span>
        </button>
      </div>

      {/* Scanner Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-3">
        {/* QR Reader */}
        <div id="qr-reader" className={`${!isScanning ? "hidden" : ""}`} />

        {/* Processing Screen */}
        {!isScanning && (
          <div className="h-[320px] flex items-center justify-center bg-gray-900 text-white font-bold rounded-2xl text-lg">
            Processing Scan... ⏳
          </div>
        )}
      </div>

      {/* Error */}
      {scanError && (
        <div className="w-full max-w-md mt-6 p-5 bg-red-500/20 border border-red-500/40 rounded-2xl text-center backdrop-blur-md">
          <p className="text-red-200 font-bold mb-4">{scanError}</p>

          <button
            onClick={closeModal}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success Modal */}
      {scannedUser && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <h2 className="text-3xl font-black text-green-400 uppercase tracking-[4px] text-center mb-2">
            Guest Verified
          </h2>

          <p className="text-white text-lg font-bold mb-6 text-center">
            {scannedUser.name} • {scannedUser.usn}
          </p>

          <img
            src={scannedUser.invitationImage}
            alt="Guest Invitation"
            className="w-full max-w-sm rounded-3xl border-4 border-green-500 shadow-[0_0_35px_rgba(34,197,94,0.4)] mb-8 object-cover"
          />

          <div className="flex flex-col w-full max-w-sm gap-4">
            {!scannedUser.entered ? (
              <button
                onClick={markAsEntered}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg transition"
              >
                <UserCheck size={24} />
                <span>Grant Entry & Check In</span>
              </button>
            ) : (
              <div className="w-full py-4 bg-gray-800 border border-green-500/30 text-green-400 font-black rounded-2xl text-center">
                ✅ Already Checked In
              </div>
            )}

            <button
              onClick={closeModal}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <XCircle size={20} />
              <span>Close & Scan Next</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom html5-qrcode Styling */}
      <style jsx global>{`
        /* Main wrapper */
        #qr-reader {
          width: 100% !important;
          border: none !important;
          padding: 0 !important;
          position: relative !important;
          overflow: hidden !important;
          border-radius: 24px !important;
          background: #fff !important;
        }

        /* Scanner region */
        #qr-reader__scan_region {
          min-height: 320px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          border-radius: 20px !important;
          background: #f5f5f5 !important;
        }

        /* Camera video */
        #qr-reader video {
          width: 100% !important;
          height: 320px !important;
          object-fit: cover !important;
          border-radius: 20px !important;
        }

        /* Permission image */
        #qr-reader__scan_region img {
          width: 80px !important;
          opacity: 0.7 !important;
        }

        /* Dashboard */
        #qr-reader__dashboard {
          width: 100% !important;
          padding: 20px !important;
          box-sizing: border-box !important;
        }

        /* Dashboard sections */
        #qr-reader__dashboard_section {
          width: 100% !important;
        }

        /* Permission button */
        #qr-reader button {
          width: 100% !important;
          background: linear-gradient(135deg, #7c3aed, #9333ea) !important;
          color: white !important;
          border: none !important;
          border-radius: 16px !important;
          padding: 14px 20px !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          margin-top: 14px !important;
          transition: 0.2s ease !important;
        }

        #qr-reader button:hover {
          opacity: 0.92 !important;
          transform: translateY(-1px);
        }

        /* Camera select dropdown */
        #qr-reader select {
          width: 100% !important;
          padding: 12px !important;
          border-radius: 14px !important;
          border: 1px solid #ddd !important;
          margin-top: 12px !important;
          font-size: 15px !important;
          outline: none !important;
        }

        /* Status text */
        #qr-reader__status_span {
          display: block !important;
          margin-top: 12px !important;
          color: #111827 !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          text-align: center !important;
        }

        /* Hide unwanted links */
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }

        /* Fix internal table layout issue */
        #qr-reader table {
          width: 100% !important;
          border: none !important;
        }

        #qr-reader td {
          border: none !important;
        }

        /* Mobile fixes */
        @media (max-width: 640px) {
          #qr-reader video {
            height: 260px !important;
          }

          #qr-reader__scan_region {
            min-height: 260px !important;
          }

          #qr-reader button {
            font-size: 15px !important;
            padding: 12px 16px !important;
          }
        }

        #qr-reader,
        #qr-reader * {
          color: black !important;
          font-family: inherit !important;
        }
      
        #qr-reader button {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
