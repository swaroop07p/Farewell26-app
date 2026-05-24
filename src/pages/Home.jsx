import React, { useContext, useState, useEffect, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { Download, QrCode, Gift } from "lucide-react";
import FlipCard from "../components/FlipCard";
import { TextFlippingBoard } from "../components/TextFlippingBoard"; 

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const [isDownloading, setIsDownloading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  
  // Track swipe animation direction
  const [slideDirection, setSlideDirection] = useState("next");

  // Swipe Tracking States
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  if (!currentUser) return null;

  const mapEmbedUrl = "https://www.google.com/maps?q=Tunturu+Garden+Resort+Shimoga+Karnataka&output=embed";
  const mapAppUrl = "https://maps.app.goo.gl/oWmhC8V61G3ehbdC7";

  const funMessages = useMemo(() => {
    const rawLineData = currentUser.funnyLine;
    let extractedPersonalLines = [];

    if (Array.isArray(rawLineData)) {
      extractedPersonalLines = rawLineData;
    } else if (typeof rawLineData === "string" && rawLineData.trim() !== "") {
      extractedPersonalLines = [rawLineData];
    } else {
      extractedPersonalLines = ["Always debugging, rarely sleeping."];
    }

    return [
      ...extractedPersonalLines,
      "Commit message: 'Fixed bugs, added new ones'",
      "Assignments are temporary, Screenshots are permanent",
      "It's not a bug, it's a feature",
      "Our attendance is lower than our phone battery",
      "My biggest achievement in engineering: opening PDF and pretending to study",
      "Internal marks are more mysterious than Bermuda Triangle",
      "Bro studies one night before exam and still says ‘I’m not prepared.’",
      "Engineering students don’t say ‘I’m busy’…we say ‘Bro assignment submission da’",
      "The real survivor of engineering is not students… it’s the printer near college.",
      "Bro our semester moves faster than our internet speed",
      "During viva, even my own name sounds unfamiliar"
    ];
  }, [currentUser.funnyLine]);

  useEffect(() => {
    const id = setInterval(() => {
      setSlideDirection("next"); // Auto-play always slides "next"
      setMsgIdx((i) => (i + 1) % funMessages.length);
    }, 6000);
    return () => clearInterval(id);
  }, [funMessages.length, msgIdx]); 

  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
    }
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      // Swiped Left -> View Previous
      setSlideDirection("prev");
      setMsgIdx((i) => (i - 1 + funMessages.length) % funMessages.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> View Next
      setSlideDirection("next");
      setMsgIdx((i) => (i + 1) % funMessages.length);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

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
        <div className="flex flex-col items-center justify-center w-full max-w-sm mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-wider text-transparent uppercase bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400 drop-shadow-md">
            Hey, {currentUser.name.split(" ")[0]}!
          </h1>
          
          <div 
            className="w-full flex flex-col items-center justify-center min-h-[90px] mt-2 relative cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
            onMouseDown={onTouchStart}
            onMouseMove={onTouchMove}
            onMouseUp={onTouchEndHandler}
            onMouseLeave={onTouchEndHandler}
          >
            {/* Passes the tracking direction dynamically to the board components */}
            <TextFlippingBoard text={funMessages[msgIdx]} direction={slideDirection} />
            
            <div className="absolute -bottom-5 text-[9px] font-black tracking-widest text-cyan-400/40 uppercase pointer-events-none drop-shadow-md">
              ⟵ Swipe ⟶
            </div>
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