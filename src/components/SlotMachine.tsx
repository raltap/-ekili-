import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { playTick } from '../utils/audio';

interface SlotMachineProps {
  names: string[];
  isDrawing: boolean;
  duration: number;
  targetWinner: string | null;
  onFinished: () => void;
  soundEnabled: boolean;
}

export default function SlotMachine({ names, isDrawing, duration, targetWinner, onFinished, soundEnabled }: SlotMachineProps) {
  const [currentName, setCurrentName] = useState('HAZIR');
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const totalDuration = duration * 1000;
    const progress = Math.min(elapsed / totalDuration, 1);

    // Exponentially decreasing tick frequency
    const currentDelay = 40 + Math.pow(progress, 3) * 600;
    
    if (time - lastTickTimeRef.current >= currentDelay) {
      if (progress < 1) {
        const randomIndex = Math.floor(Math.random() * names.length);
        setCurrentName(names[randomIndex]);
        if (soundEnabled) playTick();
        lastTickTimeRef.current = time;
      }
    }

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (targetWinner) setCurrentName(targetWinner);
      cancelAnimationFrame(requestRef.current!);
      onFinished();
    }
  };

  useEffect(() => {
    if (isDrawing && names.length > 0 && targetWinner) {
      startTimeRef.current = null;
      lastTickTimeRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    } else if (!isDrawing && !targetWinner) {
      if (names.length > 0) setCurrentName('BEKLENİYOR');
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDrawing, names, duration, targetWinner]);

  return (
    <div className="bg-indigo-950 w-full max-w-3xl h-48 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)] flex items-center justify-center border-2 border-indigo-500/30 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-transparent to-indigo-950 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)] z-10" />
      
      <div className="w-full h-full px-12 flex items-center justify-center relative z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentName}
            initial={isDrawing ? {} : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={isDrawing ? {} : { scale: 1.1, opacity: 0 }}
            transition={{ duration: isDrawing ? 0 : 0.4, ease: "easeOut" }}
            className="w-full flex items-center justify-center"
          >
            {/* SVG based text scaling ensures name fits perfectly in one line */}
            <svg viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet" className="w-full h-24 max-h-full">
               <text
                 x="500"
                 y="120"
                 textAnchor="middle"
                 className="fill-white font-black uppercase tracking-tighter"
                 style={{ fontSize: '120px' }}
               >
                 {currentName}
               </text>
            </svg>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
