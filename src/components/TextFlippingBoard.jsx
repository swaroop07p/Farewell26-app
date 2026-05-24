import React, { useEffect, useState } from "react";
import { cn } from "../utils/cn";

// Pool of random matrix tracking characters for the tumble phase
const SCRAMBLE_CHARS = "X018$#@!%&?*+=#";

// Map color tokens to glowing Tailwind presets matching your design theme
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

export function TextFlippingBoard({ text, className }) {
  const [displayLines, setDisplayLines] = useState([]);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);

  useEffect(() => {
    // Standardize line breaks if any exist
    const formatted = text.replace(/\\n/g, "\n");
    const targetLines = formatted.split("\n");

    // Process each line word by word to apply a distinct random color per word block
    const parsedLines = targetLines.map(line => {
      const lineCells = [];
      const words = line.split(" ");
      
      // Tracks the color used for the previous word on this line
      let lastColorKey = null;

      words.forEach((word, wordIdx) => {
        let randomColorKey = lastColorKey;
        
        // 🛡️ ADJACENT COLOR PROTECTION FIX
        // Keeps picking a random color key until it is DIFFERENT from the last word's color
        while (randomColorKey === lastColorKey) {
          randomColorKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
        }
        
        // Update the pointer tracking variable for the next word evaluation cycle
        lastColorKey = randomColorKey;
        const wordColorStyle = COLOR_MAP[randomColorKey].border;

        // Process every single letter character inside this isolated word block
        for (let j = 0; j < word.length; j++) {
          lineCells.push({
            final: word[j],
            current: SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
            isRevealed: false,
            customColor: wordColorStyle // Locks the same color across all letters of this word
          });
        }

        // Re-inject the separating spacer gap box if it's not the final trailing word
        if (wordIdx < words.length - 1) {
          lineCells.push({
            final: " ",
            current: " ",
            isRevealed: true,
            customColor: null
          });
        }
      });

      return lineCells;
    });

    setDisplayLines(parsedLines);
    setScrambleTrigger(prev => prev + 1);

    let step = 0;
    const maxSteps = 6;

    const interval = setInterval(() => {
      step++;

      setDisplayLines(prevLines =>
        prevLines.map(line =>
          line.map(cell => {
            if (cell.isRevealed) return cell;

            const looseMatch = Math.random() < step / maxSteps || step === maxSteps;
            return {
              ...cell,
              current: looseMatch ? cell.final : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
              isRevealed: looseMatch
            };
          })
        )
      );

      if (step >= maxSteps) clearInterval(interval);
    }, 80);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className={cn(
      "relative mx-auto w-full max-w-sm rounded-xl p-4 flex flex-col justify-center items-center gap-2 font-mono min-h-[95px] shadow-2xl transition-all duration-300",
      "bg-[#020617]/50 backdrop-blur-md border border-white/10",
      className
    )}>
      {displayLines.map((line, lineIdx) => (
        <div key={`${lineIdx}-${scrambleTrigger}`} className="flex flex-wrap items-center justify-center gap-1">
          {line.map((cell, charIdx) => {
            if (cell.current === " ") {
              return <div key={`space-${charIdx}`} className="w-2.5" />;
            }

            return (
              <div
                key={`${cell.current}-${charIdx}`}
                style={{
                  animation: `tumbleFlip 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
                  animationDelay: `${charIdx * 20}ms`, // Staggered reveal animation wave
                  transformStyle: "preserve-3d"
                }}
                className={cn(
                  "w-5 h-8 bg-black/40 border rounded-md flex items-center justify-center relative overflow-hidden transition-all duration-200",
                  cell.isRevealed
                    ? cell.customColor + " font-black" // Uniform color applied to this specific word block
                    : "border-cyan-500/40 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                )}
              >
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40 z-20" />
                <span className="z-10 text-sm leading-none tracking-normal uppercase select-none">
                  {cell.current}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      <style>{`
        @keyframes tumbleFlip {
          0% { transform: rotateX(-90deg) scale(0.95); filter: brightness(0.4); }
          100% { transform: rotateX(0deg) scale(1); filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}