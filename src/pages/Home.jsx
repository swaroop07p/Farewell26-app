import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
// Import PartyPopper here!
import {
  LogOut,
  Download,
  QrCode,
  PartyPopper,
  Gift,
  Sparkles,
} from "lucide-react";
import FlipCard from "../components/FlipCard";

export default function Home() {
  const { currentUser, logout } = useContext(AuthContext);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!currentUser) return null;

  const mapEmbedUrl =
    "https://www.google.com/maps?q=Tunturu+Garden+Resort+Shimoga+Karnataka&output=embed";


  const mapAppUrl = "https://maps.app.goo.gl/oWmhC8V61G3ehbdC7";

  const forceDownload = async (imageUrl, filename) => {
    try {
      setIsDownloading(true);
      const response = await fetch(imageUrl, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      setIsDownloading(false);
    } catch (error) {
      console.error("Download failed:", error);
      alert(
        "Could not download the image. Please try right-clicking or long-pressing the image to save it.",
      );
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 flex flex-col items-center pt-8 px-4">
      {/* Header section */}
      <div className="w-full max-w-sm flex justify-between items-center mb-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-1.5">
            Hey, {currentUser.name.split(" ")[0]}!
            <Sparkles
              size={20}
              className="text-amber-400 fill-amber-400/20 animate-pulse shrink-0"
            />
          </h1>
          <p className="text-purple-300 text-xs italic">
            "{currentUser.funnyLine}"
          </p>
        </div>

        {/* Sleek Logout Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm"
        >
          <LogOut size={14} />
          <span className="text-xs font-bold uppercase tracking-wider mt-0.5">
            Logout
          </span>
        </button>
      </div>

      {/* NEW: Single Line Glowing Party Title */}
      <div className="flex items-center justify-center space-x-3 mb-6 cursor-default bg-black/20 px-6 py-4 rounded-full border border-white/5 shadow-inner">
        <Gift
          size={35}
          className="text-pink-500 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
        />
        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-red-500 tracking-widest uppercase">
          Farewell Party
        </span>
        <Gift
          size={35}
          className="text-pink-500 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] -scale-x-100"
        />
      </div>

      {/* 3D Flip Card */}
      <FlipCard currentUser={currentUser} />

      {/* Action Buttons Section */}
      <div className="flex flex-col space-y-3 w-full max-w-sm mt-8">
        <button
          onClick={() =>
            forceDownload(
              currentUser.invitationImage,
              `${currentUser.name}_Farewell_Invite.jpg`,
            )
          }
          disabled={isDownloading}
          className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center space-x-2 transition text-white font-semibold backdrop-blur-sm shadow-md disabled:opacity-50"
        >
          <Download size={20} />
          <span>
            {isDownloading ? "Downloading..." : "Download Invitation Card"}
          </span>
        </button>

        <button
          onClick={() =>
            forceDownload(currentUser.QRImg, `${currentUser.name}_Entry_QR.jpg`)
          }
          disabled={isDownloading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition text-white font-bold disabled:opacity-50"
        >
          <QrCode size={20} />
          <span>{isDownloading ? "Downloading..." : "Download Entry QR"}</span>
        </button>
      </div>

      {/* Live Iframe Map Preview Card */}
      <div className="w-full max-w-sm mt-8 rounded-2xl border border-white/20 shadow-2xl overflow-hidden bg-white">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="220"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Venue Map"
        ></iframe>

        <a
          href={mapAppUrl}
          target="_blank"
          rel="noreferrer"
          className="block p-4 text-center hover:bg-gray-50 transition decoration-none"
        >
          <div className="text-lg font-bold text-gray-900 mb-1">
            Venue Location
          </div>
          <div className="text-sm text-purple-600 font-medium">
            Click to open in Google Maps
          </div>
        </a>
      </div>
    </div>
  );
}
