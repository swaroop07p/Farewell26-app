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
      "Assignments are temporary, Screenshots are permanent",
      "Our attendance is lower than our phone battery",
      "My biggest achievement in engineering: opening PDF and pretending to study",
      "Internal marks are more mysterious than Bermuda Triangle",
      "Bro studies one night before exam and still says ‘I’m not prepared.’",
      "Engineering students don’t say ‘I’m busy’…we say ‘Bro assignment submission da’",
      "The real survivor of engineering is not students… it’s the printer near college.",
      "Bro our semester moves faster than our internet speed"
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

        {/* ACTION BUTTONS - SIMPLIFIED TRANSLUCENT GLASS THEME */}
        <div className="flex flex-col w-full max-w-sm gap-3 mt-8">
          
          {/* 🌊 BUTTON 1: TRANSLUCENT CYAN GLASS */}
          <button
            onClick={() => forceDownload(currentUser.invitationImage, `${currentUser.name}_Farewell_Invite.jpg`)}
            disabled={isDownloading}
            className="w-full py-4 relative bg-cyan-950/20 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 font-extrabold tracking-wider uppercase rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download size={18} className="text-cyan-400 shrink-0" />
            <span>{isDownloading ? "Downloading..." : "Download Invitation Card"}</span>
          </button>

          {/* 🌿 BUTTON 2: TRANSLUCENT EMERALD GLASS */}
          <button
            onClick={() => forceDownload(currentUser.QRImg, `${currentUser.name}_Entry_QR.jpg`)}
            disabled={isDownloading}
            className="w-full py-4 relative bg-emerald-950/20 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-extrabold tracking-wider uppercase rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <QrCode size={18} className="text-emerald-400 shrink-0" />
            <span>{isDownloading ? "Downloading..." : "Download Entry QR"}</span>
          </button>

        </div>

        {/* 🗺️ THEME CONTROL: TRANSLUCENT CYBERPUNK MAP COMPONENT */}
        <div className="w-full max-w-sm mt-8 overflow-hidden border bg-[#020617]/50 backdrop-blur-md shadow-2xl rounded-2xl border-white/10">
          
          {/* ⚡ CSS Map Filter Wrapper: Inverts standard lighting matrix map data into beautiful cyberpunk dark mode lines */}
          <div className="w-full h-[220px] overflow-hidden invert-[90%] hue-rotate-[195deg] saturate-[140%] brightness-[90%] contrast-[95%]">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue Map"
            ></iframe>
          </div>

          <a 
            href={mapAppUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="block p-4 text-center transition bg-linear-to-b from-transparent to-white/[0.02] hover:bg-white/5 border-t border-white/5 decoration-none"
          >
            <div className="mb-1 text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.2)]">
              Venue Location
            </div>
            <div className="text-xs font-bold tracking-widest uppercase text-cyan-400/70">
              Click to open in Google Maps
            </div>
          </a>
        </div>
        
      </div>
    </div>
  );
}