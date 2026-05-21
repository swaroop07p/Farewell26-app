import React, { useEffect, useState, useRef, useContext } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [cameraError, setCameraError] = useState("");

  const scannerRef = useRef(null);

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setCameraError("");
      setScanError("");

      const html5QrCode = new Html5Qrcode("qr-reader");

      scannerRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        setCameraError("No camera found on this device.");
        return;
      }

      setIsScanning(true);

      await html5QrCode.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1.777778,
        },
        onScanSuccess,
        onScanFailure,
      );
    } catch (err) {
      console.error(err);

      if (
        err?.name === "NotAllowedError" ||
        err?.message?.includes("Permission denied")
      ) {
        setCameraError(
          "Camera permission denied. Please allow camera access in browser settings.",
        );
      } else {
        setCameraError("Failed to access camera.");
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (
        scannerRef.current &&
        scannerRef.current.isScanning
      ) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch (err) {
      console.log("Scanner cleanup:", err);
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      await stopScanner();

      setIsScanning(false);

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
      setScanError("Database lookup failed.");
    }
  };

  const onScanFailure = () => {
    // ignore scan failures
  };

  const markAsEntered = async () => {
    if (!scannedUser) return;

    try {
      await updateDoc(doc(db, "guests", scannedUser.id), {
        entered: true,
      });

      closeModal();
    } catch (error) {
      console.error(error);
      setScanError("Failed to update guest entry.");
    }
  };

  const closeModal = async () => {
    setScannedUser(null);
    setScanError("");

    await startScanner();
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

      {/* Scanner */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-3">
        <div id="qr-reader" />

        {!isScanning && !scannedUser && (
          <div className="h-[320px] flex items-center justify-center bg-gray-900 text-white rounded-2xl">
            Starting Camera...
          </div>
        )}
      </div>

      {/* Camera Error */}
      {cameraError && (
        <div className="w-full max-w-md mt-6 p-5 bg-red-500/20 border border-red-500/40 rounded-2xl text-center">
          <p className="text-red-200 font-bold mb-4">
            {cameraError}
          </p>

          <button
            onClick={startScanner}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition"
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* Scan Error */}
      {scanError && (
        <div className="w-full max-w-md mt-6 p-5 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl text-center">
          <p className="text-yellow-100 font-bold mb-4">
            {scanError}
          </p>

          <button
            onClick={closeModal}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold transition"
          >
            Scan Again
          </button>
        </div>
      )}

      {/* Success Modal */}
      {scannedUser && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-black text-green-400 uppercase tracking-[4px] text-center mb-2">
            Guest Verified
          </h2>

          <p className="text-white text-lg font-bold mb-6 text-center">
            {scannedUser.name} • {scannedUser.usn}
          </p>

          <img
            src={scannedUser.invitationImage}
            alt="Guest"
            className="w-full max-w-sm rounded-3xl border-4 border-green-500 mb-8"
          />

          <div className="flex flex-col w-full max-w-sm gap-4">
            {!scannedUser.entered ? (
              <button
                onClick={markAsEntered}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl flex items-center justify-center gap-2"
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
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              <XCircle size={20} />
              <span>Close & Scan Next</span>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        #qr-reader {
          width: 100%;
          border: none !important;
        }

        #qr-reader video {
          border-radius: 20px;
          height: 320px !important;
          object-fit: cover;
        }

        #qr-reader__dashboard {
          padding-top: 15px;
        }

        #qr-reader button {
          width: 100%;
          background: #7c3aed !important;
          color: white !important;
          border: none !important;
          border-radius: 14px !important;
          padding: 12px !important;
          font-weight: bold;
        }

        #qr-reader select {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}