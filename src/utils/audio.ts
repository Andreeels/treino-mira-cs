// Web Audio API Synthesizer for high-performance zero-latency FPS sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private hitsoundType: 'cs2_dink' | 'pop' | 'arcade' | 'bell' = 'cs2_dink';
  private gunshotEnabled: boolean = true;
  private trackingOsc: OscillatorNode | null = null;
  private trackingGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setConfig(muted: boolean, volume: number, hitsoundType: 'cs2_dink' | 'pop' | 'arcade' | 'bell', gunshotEnabled: boolean) {
    this.isMuted = muted;
    this.volume = Math.max(0, Math.min(1, volume));
    this.hitsoundType = hitsoundType;
    this.gunshotEnabled = gunshotEnabled;
  }

  // Gunshot sound (CS2 styled crisp AK/Deagle crack)
  public playGunshot() {
    if (this.isMuted || !this.gunshotEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterVol = this.volume * 0.35;

    // Fast noise burst for gunshot crack
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(masterVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    // Punchy sub-thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.07);

    oscGain.gain.setValueAtTime(masterVol * 0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.08);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Headshot "DINK" metallic sound (famous CS:GO / CS2 metal helmet ricochet)
  public playHeadshotDink() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterVol = this.volume * 0.9;

    // Metallic ring frequencies (inharmonic metal resonances)
    const freqs = [1860, 2940, 4120, 5600];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t + 0.28);

      const amp = (masterVol * 0.45) / (idx + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (0.18 + idx * 0.04));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });

    // High snap click
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(3200, t);
    snap.frequency.exponentialRampToValueAtTime(900, t + 0.02);
    snapGain.gain.setValueAtTime(masterVol * 0.5, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snap.start(t);
    snap.stop(t + 0.02);
  }

  // Hit sound based on selected type
  public playHit(isHeadshot: boolean = false) {
    if (this.isMuted) return;

    if (isHeadshot || this.hitsoundType === 'cs2_dink') {
      this.playHeadshotDink();
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterVol = this.volume * 0.7;

    if (this.hitsoundType === 'pop') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.09);

      gain.gain.setValueAtTime(masterVol * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } else if (this.hitsoundType === 'arcade') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1320, t + 0.04);

      gain.gain.setValueAtTime(masterVol * 0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } else {
      // Bell
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(masterVol * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  // Miss shot sound (whiff ricochet or dull air snap)
  public playMiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Continuous tracking hum/sparkle
  public startTrackingSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (!this.trackingOsc) {
      this.trackingOsc = this.ctx.createOscillator();
      this.trackingGain = this.ctx.createGain();

      this.trackingOsc.type = 'sine';
      this.trackingOsc.frequency.setValueAtTime(540, this.ctx.currentTime);

      this.trackingGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.trackingGain.gain.linearRampToValueAtTime(this.volume * 0.25, this.ctx.currentTime + 0.05);

      this.trackingOsc.connect(this.trackingGain);
      this.trackingGain.connect(this.ctx.destination);
      this.trackingOsc.start();
    }
  }

  public stopTrackingSound() {
    if (this.trackingOsc && this.trackingGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.trackingGain.gain.linearRampToValueAtTime(0.0001, t + 0.05);
      setTimeout(() => {
        try {
          this.trackingOsc?.stop();
          this.trackingOsc?.disconnect();
          this.trackingGain?.disconnect();
        } catch {
          // ignore
        }
        this.trackingOsc = null;
        this.trackingGain = null;
      }, 60);
    }
  }

  // Countdown beep (pitch 440Hz for 3, 2, 1; 880Hz for GO!)
  public playCountdown(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    const freq = isFinal ? 880 : 440;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(this.volume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isFinal ? 0.35 : 0.15));
  }

  // Exercise completed fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    chords.forEach((f, i) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(this.volume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }
}

export const soundManager = new SoundManager();
