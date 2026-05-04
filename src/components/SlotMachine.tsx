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
  const [currentName, setCurrentName] = useState('KATILIMCI YOK');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDrawing && names.length > 0 && targetWinner) {
      let startTime = Date.now();
      const maxTime = duration * 1000;

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / maxTime;
        const currentDelay = 50 + Math.pow(progress, 2.5) * 400;

        if (elapsed < maxTime) {
          const randomIndex = Math.floor(Math.random() * names.length);
          setCurrentName(names[randomIndex]);
          if (soundEnabled) playTick();
          timerRef.current = setTimeout(tick, currentDelay);
        } else {
          setCurrentName(targetWinner);
          onFinished();
        }
      };

      tick();
    } else if (!isDrawing && !targetWinner) {
      setCurrentName(names.length > 0 ? names[0] : 'KATILIMCI YOK');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDrawing, names, duration, targetWinner, onFinished, soundEnabled]);

  return (
    <div className="bg-indigo-950 w-full max-w-2xl h-40 rounded-3xl shadow-2xl flex items-center justify-center border border-indigo-400/30 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-transparent to-indigo-950 z-10 pointer-events-none" />
      
      <div className="w-full px-8 text-center relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentName}
            initial={isDrawing ? {} : { y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={isDrawing ? {} : { y: -15, opacity: 0 }}
            transition={{ duration: isDrawing ? 0 : 0.3 }}
            className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis leading-none"
          >
            {currentName}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
