let audioCtx: AudioContext | null = null;
let lastTickTime = 0;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playTick = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  // Hızlı çekilişte sesleri çok sık çalarak kasmayı önlemek için 60ms koruması
  if (now - lastTickTime < 0.06) return;
  lastTickTime = now;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1200, now);
  gainNode.gain.setValueAtTime(0.015, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(now + 0.04);
};

export const playWin = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(440, now);
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.6);
  
  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(now + 1.2);
};
