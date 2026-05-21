import React, { useEffect, useState, useContext, useRef } from "react";
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
  const [loading, setLoading] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;

    // Prevent multiple scanner instances
    if (scannerRef.current) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0],
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(handleScanSuccess, handleScanError);

    async function handleScanSuccess(decodedText) {
      try {
        setLoading(true);
        setScanError("");

        // Stop scanner after successful scan
        await scanner.clear();
        scannerRef.current = null;

        setIsScanning(false);

        const formattedUSN = decodedText.trim().toUpperCase();

        const q = query(
          collection(db, "guests"),
          where("usn", "==", formattedUSN),
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const guestDoc = querySnapshot.docs[0];

          setScannedUser({
            id: guestDoc.id,
            ...guestDoc.data(),
          });
        } else {
          setScanError(`No guest found for USN: ${formattedUSN}`);
        }
      } catch (error) {
        console.error(error);
        setScanError("Error while scanning QR code.");
      } finally {
        setLoading(false);
      }
    }

    function handleScanError(error) {
      // Ignore continuous scan errors
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Scanner cleanup error:", err));

        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const markAsEntered = async () => {
    try {
      if (!scannedUser) return;

      await updateDoc(doc(db, "guests", scannedUser.id), {
        entered: true,
      });

      setScannedUser((prev) => ({
        ...prev,
        entered: true,
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to update guest entry.");
    }
  };

  const closeModal = async () => {
    setScannedUser(null);
    setScanError("");
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 px-4 pb-20 text-black">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            VIP Scanner
          </h1>
          <p className="text-gray-300 text-xs font-bold tracking-widest">
            GATE ENTRY MODE
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm"
        >
          <LogOut size={14} />
          <span className="text-xs font-bold uppercase tracking-wider mt-0.5">
            Exit
          </span>
        </button>
      </div>

      {/* Scanner Box */}
      <div className="w-full max-w-md bg-white border border-gray-300 rounded-2xl shadow-lg p-4">
        {isScanning && (
          <div id="qr-reader" className="w-full overflow-hidden rounded-xl" />
        )}

        {!isScanning && loading && (
          <div className="h-[300px] flex items-center justify-center rounded-xl bg-gray-100 text-black text-lg font-semibold">
            Processing Scan...
          </div>
        )}
      </div>

      {/* Error Message */}
      {scanError && (
        <div className="w-full max-w-md mt-6 bg-red-100 border border-red-400 rounded-xl p-4 text-center">
          <p className="text-red-700 font-semibold mb-4">{scanError}</p>

          <button
            onClick={closeModal}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success Modal */}
      {scannedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-2">
              Guest Verified
            </h2>

            <p className="text-black font-medium mb-5">
              {scannedUser.name} • {scannedUser.usn}
            </p>

            {scannedUser.invitationImage && (
              <img
                src={scannedUser.invitationImage}
                alt="Invitation"
                className="w-full rounded-xl border border-gray-300 mb-6 object-cover"
              />
            )}

            <div className="flex flex-col gap-3">
              {!scannedUser.entered ? (
                <button
                  onClick={markAsEntered}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <UserCheck size={22} />
                  Grant Entry & Check In
                </button>
              ) : (
                <div className="w-full py-3 bg-green-100 border border-green-400 rounded-xl text-green-700 font-semibold">
                  Already Checked In
                </div>
              )}

              <button
                onClick={closeModal}
                className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Close & Scan Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
