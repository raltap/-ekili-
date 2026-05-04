let audioCtx: AudioContext | null = null;
let lastTickTime = 0;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playTick = () => {
  const ctx = getAudioCtx();
  // Throttle ticks to prevent audio clutter
  if (ctx.currentTime - lastTickTime < 0.05) return;
  lastTickTime = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.03);
};

export const playWin = () => {
  const ctx = getAudioCtx();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(500, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.5);
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 1);
};
