import React, { useEffect, useState } from "react";
import { cn } from "../utils/cn";

const SCRAMBLE_CHARS = "X018$#@!%&?*+=#";

const COLOR_MAP = {
  red: { border: "border-red-500/40 text-red-400 bg-red-950/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]" },
  orange: { border: "border-orange-500/40 text-orange-400 bg-orange-950/40 shadow-[0_0_8px_rgba(249,115,22,0.2)]" },
  yellow: { border: "border-yellow-500/40 text-yellow-400 bg-yellow-950/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]" },
  emerald: { border: "border-emerald-500/40 text-emerald-400 bg-emerald-950/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]" },
  cyan: { border: "border-cyan-500/40 text-cyan-400 bg-cyan-950/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]" },
  purple: { border: "border-purple-500/40 text-purple-400 bg-purple-950/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]" },
  pink: { border: "border-pink-500/40 text-pink-400 bg-pink-950/40 shadow-[0_0_8px_rgba(236,72,153,0.3)]" },
};

const COLOR_KEYS = Object.keys(COLOR_MAP);

export function TextFlippingBoard({ text, direction = "next", className }) {
  const [displayLines, setDisplayLines] = useState([]);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);

  useEffect(() => {
    const formatted = text.replace(/\\n/g, "\n");
    const targetLines = formatted.split("\n");

    let globalCharIdx = 0; 

    const parsedLines = targetLines.map((line, lineIdx) => {
      const words = line.split(" ");
      
      let lastColorKey = null;
      const colorCounts = {}; 

      return words.map((word, wordIdx) => {
        let randomColorKey = lastColorKey;
        
        let attempts = 0;
        while (
          (randomColorKey === lastColorKey || (colorCounts[randomColorKey] >= 3)) &&
          attempts < 20
        ) {
          randomColorKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
          attempts++;
        }
        
        lastColorKey = randomColorKey;
        colorCounts[randomColorKey] = (colorCounts[randomColorKey] || 0) + 1;
        const wordColorStyle = COLOR_MAP[randomColorKey].border;

        const wordCells = [];
        for (let j = 0; j < word.length; j++) {
          wordCells.push({
            id: `${lineIdx}-${wordIdx}-${j}`,
            final: word[j],
            current: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
            isRevealed: false,
            customColor: wordColorStyle,
            globalIdx: globalCharIdx++ 
          });
        }

        return {
          wordIdx,
          cells: wordCells
        };
      });
    });

    setDisplayLines(parsedLines);
    setScrambleTrigger(prev => prev + 1);

    let step = 0;
    const maxSteps = 6;

    const interval = setInterval(() => {
      step++;

      setDisplayLines(prevLines =>
        prevLines.map(line =>
          line.map(wordObj => ({
            ...wordObj,
            cells: wordObj.cells.map(cell => {
              if (cell.isRevealed) return cell;
              const looseMatch = Math.random() < step / maxSteps || step === maxSteps;
              return {
                ...cell,
                current: looseMatch ? cell.final : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
                isRevealed: looseMatch
              };
            })
          }))
        )
      );

      if (step >= maxSteps) clearInterval(interval);
    }, 80);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className={cn(
      "relative mx-auto w-full max-w-sm rounded-xl p-4 flex flex-col justify-center items-center font-mono min-h-[95px] shadow-2xl transition-all duration-300",
      "bg-[#020617]/50 backdrop-blur-md border border-white/10",
      className
    )}>
      {/* ✨ SWIPE ANIMATION FIX ✨
        By adding key={scrambleTrigger}, React rebuilds this block every swipe, 
        triggering our smooth physical slide animations perfectly!
      */}
      <div 
        key={scrambleTrigger} 
        className={cn(
          "w-full flex flex-col items-center justify-center gap-y-2",
          direction === "next" ? "animate-slide-next" : "animate-slide-prev"
        )}
      >
        {displayLines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex flex-wrap items-center justify-center w-full gap-x-3 gap-y-2">
            {line.map((wordObj) => (
              <div key={wordObj.wordIdx} className="flex gap-1 flex-nowrap">
                {wordObj.cells.map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      animation: `tumbleFlip 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
                      animationDelay: `${cell.globalIdx * 20}ms`,
                      transformStyle: "preserve-3d"
                    }}
                    className={cn(
                      "w-5 h-8 bg-black/40 border rounded-md flex items-center justify-center relative overflow-hidden shrink-0",
                      cell.isRevealed
                        ? cell.customColor + " font-black"
                        : "border-cyan-500/40 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    )}
                  >
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40 z-20" />
                    <span className="z-10 text-sm leading-none tracking-normal uppercase select-none">
                      {cell.current}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes tumbleFlip {
          0% { transform: rotateX(-90deg) scale(0.95); filter: brightness(0.4); }
          100% { transform: rotateX(0deg) scale(1); filter: brightness(1); }
        }
        
        /* Smooth Slide Animations */
        @keyframes slideNext {
          0% { opacity: 0; transform: translateX(25px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slidePrev {
          0% { opacity: 0; transform: translateX(-25px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        .animate-slide-next { animation: slideNext 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .animate-slide-prev { animation: slidePrev 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}</style>
    </div>
  );
}