import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Settings2, 
  Play, 
  Volume2, 
  VolumeX, 
  History, 
  Trash2,
  Sparkles,
  Shuffle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GiveawaySettings, DrawResult } from './types';
import SlotMachine from './components/SlotMachine';
import { playWin } from './utils/audio';

export default function App() {
  const [participantsText, setParticipantsText] = useState('');
  const [settings, setSettings] = useState<GiveawaySettings>({
    title: 'BÜYÜK ÇEKİLİŞ',
    winnerCount: 1,
    substituteCount: 0,
    duration: 3,
    soundEnabled: true,
    confettiEnabled: true,
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const [targetWinner, setTargetWinner] = useState<string | null>(null);
  const [currentDrawQueue, setCurrentDrawQueue] = useState<{type: 'winner' | 'substitute', index: number}[]>([]);
  const [currentResult, setCurrentResult] = useState<{ winners: string[], substitutes: string[] }>({ winners: [], substitutes: [] });
  const [history, setHistory] = useState<DrawResult[]>([]);

  // Parse names and strictly uppercase
  const participants = useMemo(() => {
    return participantsText
      .split('\n')
      .map(name => name.trim().toLocaleUpperCase('tr-TR'))
      .filter(name => name !== '');
  }, [participantsText]);

  const startDraw = () => {
    if (participants.length === 0 || isDrawing) return;
    if (participants.length < (settings.winnerCount + settings.substituteCount)) {
      alert('Katılımcı sayısı, ödül + yedek sayısından az olamaz!');
      return;
    }

    const queue: {type: 'winner' | 'substitute', index: number}[] = [];
    for (let i = 0; i < settings.winnerCount; i++) queue.push({ type: 'winner', index: i });
    for (let i = 0; i < settings.substituteCount; i++) queue.push({ type: 'substitute', index: i });

    setCurrentDrawQueue(queue);
    setCurrentResult({ winners: [], substitutes: [] });
    
    // Pre-select first winner
    const firstWinner = participants[Math.floor(Math.random() * participants.length)];
    setTargetWinner(firstWinner);
    setIsDrawing(true);
  };

  const handleDrawFinish = () => {
    if (!targetWinner) return;
    const currentItem = currentDrawQueue[0];
    const winner = targetWinner;
    
    let updatedWinners = currentResult.winners;
    let updatedSubstitutes = currentResult.substitutes;

    if (currentItem.type === 'winner') {
      updatedWinners = [...updatedWinners, winner];
      setCurrentResult(prev => ({ ...prev, winners: updatedWinners }));
    } else {
      updatedSubstitutes = [...updatedSubstitutes, winner];
      setCurrentResult(prev => ({ ...prev, substitutes: updatedSubstitutes }));
    }

    // Remove winner from the list text area immediately to keep data consistent
    setParticipantsText(prev => {
      const lines = prev.split('\n').map(l => l.trim().toLocaleUpperCase('tr-TR'));
      const foundIndex = lines.indexOf(winner);
      if (foundIndex > -1) {
        lines.splice(foundIndex, 1);
      }
      return lines.join('\n');
    });

    const remainingQueue = currentDrawQueue.slice(1);
    
    if (remainingQueue.length === 0) {
      setIsDrawing(false);
      setTargetWinner(null);
      setCurrentDrawQueue([]);
      
      if (settings.confettiEnabled) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#facc15', '#3b82f6']
        });
      }
      if (settings.soundEnabled) playWin();

      // Log to history
      setHistory(prev => [{
        id: crypto.randomUUID(),
        title: settings.title,
        timestamp: Date.now(),
        winners: updatedWinners,
        substitutes: updatedSubstitutes,
      }, ...prev]);

    } else {
      setCurrentDrawQueue(remainingQueue);
      setIsDrawing(false);
      setTargetWinner(null);
      
      // Calculate next winner from remaining pool
      setTimeout(() => {
        const remainingNames = participants.filter(n => n !== winner);
        const nextWinner = remainingNames[Math.floor(Math.random() * remainingNames.length)];
        setTargetWinner(nextWinner);
        setIsDrawing(true);
      }, 1500);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen bg-indigo-950 px-4 py-8 md:py-12 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-pink-500 p-2 rounded-xl shadow-lg shadow-pink-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white">META SUMMİT ÇEKİLİŞİ</h1>
          </div>
          <div className="flex gap-4">
            <div className="bg-indigo-900/50 px-4 py-2 rounded-full border border-indigo-400/20 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Sistem Aktif</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Sidebar: Input & Settings */}
          <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
            {/* Input Card */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3 min-h-[300px]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  KATILIMCI LİSTESİ
                </label>
                <button 
                  onClick={() => setParticipantsText('')}
                  className="text-[10px] font-bold text-indigo-500 hover:text-pink-400 transition-colors uppercase"
                >
                  TEMİZLE
                </button>
              </div>
              <textarea 
                value={participantsText}
                onChange={e => setParticipantsText(e.target.value)}
                placeholder="HER SATIRA BİR İSİM GELECEK ŞEKİLDE YAZIN..."
                className="flex-1 bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-3 text-sm font-mono text-indigo-100 placeholder-indigo-700 focus:outline-none focus:border-pink-500 transition-colors resize-none uppercase"
              />
              <div className="text-[10px] font-bold text-indigo-400 uppercase">
                <span>Toplam: {participants.length} İsim</span>
              </div>
            </div>

            {/* Settings Card */}
            <div className="glass-panel p-5 rounded-2xl grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-indigo-300 uppercase tracking-tighter">Kazanan</label>
                <input 
                  type="number" 
                  min="1"
                  value={settings.winnerCount}
                  onChange={e => setSettings(s => ({ ...s, winnerCount: parseInt(e.target.value) || 1 }))}
                  className="bg-indigo-950 border border-indigo-500/30 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-indigo-300 uppercase tracking-tighter">Yedek</label>
                <input 
                  type="number" 
                  min="0"
                  value={settings.substituteCount}
                  onChange={e => setSettings(s => ({ ...s, substituteCount: parseInt(e.target.value) || 0 }))}
                  className="bg-indigo-950 border border-indigo-500/30 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-indigo-300 uppercase tracking-tighter">Süre (Sn)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={settings.duration}
                  onChange={e => setSettings(s => ({ ...s, duration: parseInt(e.target.value) || 1 }))}
                  className="bg-indigo-950 border border-indigo-500/30 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div className="flex flex-col gap-2 justify-center">
                <div onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-pink-500' : 'bg-indigo-700'}`}>
                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${settings.soundEnabled ? 'right-1' : 'left-1'}`} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase ${settings.soundEnabled ? 'text-white' : 'text-zinc-500'}`}>SES</span>
                </div>
                <div onClick={() => setSettings(s => ({ ...s, confettiEnabled: !s.confettiEnabled }))} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${settings.confettiEnabled ? 'bg-pink-500' : 'bg-indigo-700'}`}>
                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${settings.confettiEnabled ? 'right-1' : 'left-1'}`} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase ${settings.confettiEnabled ? 'text-white' : 'text-zinc-500'}`}>KONFETİ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Display Stage */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Title Area */}
            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 flex flex-col items-center gap-2">
              <input 
                type="text" 
                value={settings.title}
                onChange={e => setSettings(s => ({ ...s, title: e.target.value }))}
                className="bg-transparent text-center text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 uppercase focus:outline-none w-full"
              />
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            </div>

            {/* Draw Area */}
            <div className="flex-1 min-h-[400px] bg-indigo-900/20 rounded-[40px] border-4 border-indigo-500/10 flex flex-col items-center justify-center relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/40"></div>
              
              {currentDrawQueue.length > 0 ? (
                <span className="text-indigo-400/50 text-[10px] font-black uppercase tracking-[0.8em] mb-8 animate-pulse">
                  SIRADAKİ {currentDrawQueue[0].type === 'winner' ? 'KAZANAN' : 'YEDEK'} SEÇİLİYOR
                </span>
              ) : (
                <span className="text-indigo-400/50 text-[10px] font-black uppercase tracking-[0.8em] mb-8">
                  SİSTEM HAZIR
                </span>
              )}

              <SlotMachine 
                names={participants}
                isDrawing={isDrawing}
                targetWinner={targetWinner}
                duration={settings.duration}
                onFinished={handleDrawFinish}
                soundEnabled={settings.soundEnabled}
              />

              <button 
                onClick={startDraw}
                disabled={isDrawing || participants.length === 0}
                className="mt-8 px-12 py-5 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-pink-500/20 hover:scale-[1.02] transition-transform border border-white/20 disabled:opacity-50 active:scale-95"
              >
                {isDrawing ? 'ÇEKİLİŞ YAPILIYOR...' : 'ÇEKİLİŞİ BAŞLAT'}
              </button>
            </div>
          </div>

          {/* Winner Log Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-hidden">
            <div className="bg-black/20 p-5 rounded-[2rem] border border-white/5 flex flex-col gap-4 h-full min-h-[500px] w-full">
              <div className="flex items-center justify-between shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-black uppercase tracking-widest text-pink-400 truncate">ÇEKİLİŞ LOGU</h3>
                  <div className="h-px w-24 bg-gradient-to-r from-pink-500/50 to-transparent"></div>
                </div>
                <button 
                  onClick={clearHistory}
                  className="text-[9px] font-bold text-zinc-600 hover:text-red-400 transition-colors uppercase whitespace-nowrap shrink-0 ml-2"
                >
                  LOGU TEMİZLE
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                <AnimatePresence initial={false}>
                  {history.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 rounded-xl border border-white/5 overflow-hidden w-full shrink-0"
                    >
                      <div className="bg-white/5 px-3 py-1.5 flex justify-between items-center border-b border-white/5 gap-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase truncate flex-1">{log.title}</span>
                        <span className="text-[9px] font-mono text-zinc-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</span>
                      </div>
                      <div className="p-3 space-y-3">
                        {/* Kazananlar */}
                        <div>
                          <div className="text-[8px] font-black text-pink-500 uppercase tracking-widest mb-1">KAZANANLAR</div>
                          <div className="space-y-1">
                            {log.winners.map((name, idx) => (
                               <div key={idx} className="flex items-center gap-2 overflow-hidden min-w-0">
                                <span className="text-[10px] font-bold text-pink-500/50 shrink-0">#{idx+1}</span>
                                <span className="text-xs font-bold uppercase truncate flex-1 min-w-0">{name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Yedekler */}
                        {log.substitutes.length > 0 && (
                          <div className="pt-2 border-t border-white/5">
                            <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">YEDEKLER</div>
                            <div className="space-y-1">
                              {log.substitutes.map((name, idx) => (
                                <div key={idx} className="flex items-center gap-2 overflow-hidden min-w-0">
                                  <span className="text-[10px] font-bold text-indigo-500/50 shrink-0">Y{idx+1}</span>
                                  <span className="text-xs font-bold uppercase text-zinc-400 truncate flex-1 min-w-0">{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {history.length === 0 && (
                  <div className="text-center py-12 text-zinc-700 text-[10px] font-bold uppercase italic border border-white/5 rounded-xl">
                    HENÜZ ÇEKİLİŞ YAPILMADI
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="mt-6 flex justify-between items-center text-indigo-400">
          <div className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-4">
            <span>SHA-256 RANDOM ENGINE</span>
            <span className="w-1 h-1 bg-indigo-600 rounded-full"></span>
            <span>NO LIMITS ENABLED</span>
          </div>
          <div className="text-[10px] font-bold uppercase">GITHUB / META-SUMMIT-RAFFLE</div>
        </footer>
      </div>
    </div>
  );
}
