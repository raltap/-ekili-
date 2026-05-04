import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { playTick } from '../utils/audio';

interface SlotMachineProps {
  names: string[];
  isDrawing: boolean;
  duration: number; // seconds
  onFinished: (winner: string) => void;
  soundEnabled: boolean;
}

export default function SlotMachine({ names, isDrawing, duration, onFinished, soundEnabled }: SlotMachineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayNames, setDisplayNames] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDrawing && names.length > 0) {
      let startTime = Date.now();
      let currentDuration = 50; // initial speed ms
      const maxTime = duration * 1000;

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / maxTime;

        // Exponential slowdown
        currentDuration = 50 + Math.pow(progress, 3) * 500;

        setCurrentIndex((prev) => (prev + 1) % names.length);
        if (soundEnabled) playTick();

        if (elapsed < maxTime) {
          timerRef.current = setTimeout(tick, currentDuration);
        } else {
          // Final result
          const finalIndex = Math.floor(Math.random() * names.length);
          setCurrentIndex(finalIndex);
          onFinished(names[finalIndex]);
        }
      };

      tick();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDrawing, names, duration, onFinished, soundEnabled]);

  return (
    <div className="bg-indigo-950 w-full max-w-2xl h-48 rounded-3xl shadow-2xl flex items-center justify-center border border-indigo-400/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-transparent to-indigo-950 z-10 pointer-events-none" />
      <AnimatePresence mode="wait">
        <motion.div
          key={names[currentIndex] || 'waiting'}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: isDrawing ? 0.05 : 0.4 }}
          className="text-5xl md:text-7xl font-black text-white text-center px-4 tracking-tight uppercase"
        >
          {names[currentIndex] || 'KATILIMCI YOK'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
