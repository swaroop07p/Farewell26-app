import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { Download, QrCode, Gift } from "lucide-react";
import FlipCard from "../components/FlipCard";
import { TextFlippingBoard } from "../components/TextFlippingBoard"; 

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const [isDownloading, setIsDownloading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  if (!currentUser) return null;

  const mapEmbedUrl = "https://www.google.com/maps?q=Tunturu+Garden+Resort+Shimoga+Karnataka&output=embed";
  const mapAppUrl = "https://maps.app.goo.gl/oWmhC8V61G3ehbdC7";

  // Extracts and combines user statements dynamically using the native funnyLine property key
  const funMessages = useMemo(() => {
    const rawLineData = currentUser.funnyLine;
    let extractedPersonalLines = [];

    // Smart Validation: Checks if funnyLine is an Array list or a plain Text string
    if (Array.isArray(rawLineData)) {
      extractedPersonalLines = rawLineData;
    } else if (typeof rawLineData === "string" && rawLineData.trim() !== "") {
      extractedPersonalLines = [rawLineData];
    } else {
      extractedPersonalLines = ["Always debugging, rarely sleeping."];
    }

    // Appends the global rotational pool items cleanly to the end
    return [
      ...extractedPersonalLines,
      "Commit message: 'Fixed bugs, added new ones'",
      "Assignments are temporary, Screenshots are permanent",
      "It's not a bug, it's a feature",
      "Our attendance is lower than our phone battery",
      "My biggest achievement in engineering: opening PDF and pretending to study",
      "Internal marks are more mysterious than Bermuda Triangle",
      "Bro studies one night before exam and still says ‘I’m not prepared.’",
      "Engineering students don’t say ‘I’m busy’…we say ‘Bro assignment submission da",
      "The real survivor of engineering is not students… it’s the printer near college.",
      "Bro our semester moves faster than our internet speed",
      "During viva, even my own name sounds unfamiliar",
    ];
  }, [currentUser.funnyLine]);

  const next = useCallback(() => {
    setMsgIdx((i) => (i + 1) % funMessages.length);
  }, [funMessages.length]);

  useEffect(() => {
    const id = setInterval(next, 6000); // Transitions blocks smoothly every 6 seconds
    return () => clearInterval(id);
  }, [next]);

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
      alert("Could not download the image. Please try right-clicking or long-pressing the image to save it.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 pt-8 overflow-x-hidden overflow-y-auto bg-transparent pb-28">
      <div className="relative z-10 flex flex-col items-center w-full">
        
        {/* HEADER CONTAINER */}
        <div className="flex flex-col items-center justify-center w-full max-w-sm mb-6 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-wider text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
            Hey, {currentUser.name.split(" ")[0]}!
          </h1>
          
          <div className="w-full flex items-center justify-center min-h-[90px] mt-2 mb-4">
            <TextFlippingBoard text={funMessages[msgIdx]} />
          </div>
        </div>

        {/* PARTY TITLE */}
        <div className="flex items-center justify-center px-6 py-4 mb-6 space-x-3 border rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-default bg-[#020617]/50 backdrop-blur-md border-white/10">
          <Gift size={35} className="text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-2xl font-extrabold tracking-widest text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
            Farewell Party
          </span>
          <Gift size={35} className="text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] -scale-x-100" />
        </div>

        {/* 3D Flip Card */}
        <FlipCard currentUser={currentUser} />

        {/* ACTION BUTTONS */}
        <div className="flex flex-col w-full max-w-sm mt-8 space-y-3">
          <button
            onClick={() => forceDownload(currentUser.invitationImage, `${currentUser.name}_Farewell_Invite.jpg`)}
            disabled={isDownloading}
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center justify-center space-x-2 transition text-white font-semibold backdrop-blur-md shadow-md disabled:opacity-50"
          >
            <Download size={20} />
            <span>{isDownloading ? "Downloading..." : "Download Invitation Card"}</span>
          </button>

          <button
            onClick={() => forceDownload(currentUser.QRImg, `${currentUser.name}_Entry_QR.jpg`)}
            disabled={isDownloading}
            className="w-full py-3.5 bg-linear-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,242,165,0.4)] transition text-gray-900 font-extrabold disabled:opacity-50"
          >
            <QrCode size={20} />
            <span>{isDownloading ? "Downloading..." : "Download Entry QR"}</span>
          </button>
        </div>

        {/* MAP */}
        <div className="w-full max-w-sm mt-8 overflow-hidden bg-white border shadow-2xl rounded-2xl border-white/20">
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

          <a href={mapAppUrl} target="_blank" rel="noreferrer" className="block p-4 text-center transition hover:bg-gray-50 decoration-none">
            <div className="mb-1 text-lg font-bold text-gray-900">Venue Location</div>
            <div className="text-sm font-medium text-cyan-600">Click to open in Google Maps</div>
          </a>
        </div>
      </div>
    </div>
  );
}