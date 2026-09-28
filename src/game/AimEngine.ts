import { ExerciseId, GameSettings, RoundStats } from '../types/aim';
import { soundManager } from '../utils/audio';
import { TARGET_THEMES } from '../utils/constants';

export interface Target {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  spawnTime: number;
  maxHp: number;
  currentHp: number;
  isHeadshotZone?: boolean;
  headRadius?: number;
  bodyWidth?: number;
  bodyHeight?: number;
  facingDirection?: number; // 1 or -1
  strafeTimer?: number;
  isReflexWaiting?: boolean;
  color?: string;
  shrinkRate?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface EngineStatsCallbackData {
  score: number;
  timeLeft: number;
  hits: number;
  misses: number;
  totalClicks: number;
  accuracy: number;
  kps: number;
  lastReactionMs: number | null;
  avgReactionMs: number;
  bestReactionMs: number;
  trackingPercent: number;
  headshotPercent: number;
  combo: number;
  countdown: number | null; // 3, 2, 1 or null when active
}

export class AimEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private exerciseId: ExerciseId;
  private durationSeconds: number; // 0 = infinite
  private settings: GameSettings;
  private onStatsUpdate: (data: EngineStatsCallbackData) => void;
  private onFinish: (stats: RoundStats) => void;

  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private lastTimestamp: number = 0;

  // Countdown state
  private countdownValue: number | null = 3;
  private countdownStartTime: number = 0;

  // Game data
  private targets: Target[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  // Stats
  private score: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private totalClicks: number = 0;
  private headshots: number = 0;
  private combo: number = 0;
  private reactionTimes: number[] = [];
  private bestReactionMs: number = 9999;
  
  // Tracking specifics
  private trackingTicksTotal: number = 0;
  private trackingTicksHit: number = 0;
  private isCurrentlyTracking: boolean = false;

  // Mouse / Pointer Lock virtual crosshair
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isMouseDown: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    exerciseId: ExerciseId,
    durationSeconds: number,
    settings: GameSettings,
    onStatsUpdate: (data: EngineStatsCallbackData) => void,
    onFinish: (stats: RoundStats) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.exerciseId = exerciseId;
    this.durationSeconds = durationSeconds;
    this.settings = settings;
    this.onStatsUpdate = onStatsUpdate;
    this.onFinish = onFinish;

    // Center initial mouse
    this.mouseX = canvas.width / 2;
    this.mouseY = canvas.height / 2;

    this.resizeCanvas();
  }

  public updateSettings(settings: GameSettings) {
    this.settings = settings;
    soundManager.setConfig(
      !settings.soundEnabled,
      settings.hitsoundVolume,
      settings.hitsoundType,
      settings.gunshotSound
    );
  }

  public resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const displayWidth = Math.floor(rect.width);
    const displayHeight = Math.floor(rect.height);

    if (this.canvas.width !== displayWidth * dpr || this.canvas.height !== displayHeight * dpr) {
      this.canvas.width = displayWidth * dpr;
      this.canvas.height = displayHeight * dpr;
      this.ctx.scale(dpr, dpr);
    }
  }

  public start() {
    this.resizeCanvas();
    this.isRunning = true;
    this.isPaused = false;
    this.countdownValue = 3;
    this.countdownStartTime = performance.now();
    soundManager.playCountdown(false);

    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  public pause() {
    this.isPaused = true;
    soundManager.stopTrackingSound();
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
  }

  public stop() {
    this.isRunning = false;
    soundManager.stopTrackingSound();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // Handle pointer movements
  public handleMouseMove(e: MouseEvent) {
    if (!this.isRunning || this.isPaused) return;

    const rect = this.canvas.getBoundingClientRect();

    if (this.settings.pointerLockMode && document.pointerLockElement === this.canvas) {
      // Raw movement with CS2 sensitivity scaling
      // In CS2, 1 sensitivity is roughly ~ 0.022 degrees per count, scaled to 2D canvas
      const sensMultiplier = (this.settings.csSensitivity || 1.25) * 1.0;
      this.mouseX += e.movementX * sensMultiplier;
      this.mouseY += e.movementY * sensMultiplier;
    } else {
      // Direct mouse cursor coordinates relative to canvas
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    }

    // Clamp inside canvas bounds
    this.mouseX = Math.max(10, Math.min(rect.width - 10, this.mouseX));
    this.mouseY = Math.max(10, Math.min(rect.height - 10, this.mouseY));
  }

  // Handle mouse click / shoot
  public handleMouseDown(e: MouseEvent) {
    if (!this.isRunning || this.isPaused || this.countdownValue !== null) return;
    if (e.button !== 0) return; // Left click only

    this.isMouseDown = true;
    this.totalClicks++;

    soundManager.playGunshot();

    const clickedTarget = this.checkHit(this.mouseX, this.mouseY);

    if (clickedTarget) {
      this.onTargetHit(clickedTarget, this.mouseX, this.mouseY);
    } else {
      this.onTargetMiss(this.mouseX, this.mouseY);
    }
  }

  public handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  private checkHit(x: number, y: number): { target: Target; isHeadshot: boolean } | null {
    // Check targets in reverse order (topmost first)
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];

      // For CS2 Strafe dummy (composite head + body)
      if (target.isHeadshotZone && target.headRadius && target.bodyWidth && target.bodyHeight) {
        // Head check
        const headY = target.y - target.bodyHeight / 2;
        const distHead = Math.hypot(x - target.x, y - headY);
        if (distHead <= target.headRadius) {
          return { target, isHeadshot: true };
        }

        // Body check (rounded box)
        const left = target.x - target.bodyWidth / 2;
        const right = target.x + target.bodyWidth / 2;
        const top = target.y - target.bodyHeight / 2 + target.headRadius;
        const bottom = target.y + target.bodyHeight / 2;
        if (x >= left && x <= right && y >= top && y <= bottom) {
          return { target, isHeadshot: false };
        }
      } else {
        // Standard circle hit check
        const dist = Math.hypot(x - target.x, y - target.y);
        if (dist <= target.radius) {
          return { target, isHeadshot: false };
        }
      }
    }
    return null;
  }

  private onTargetHit(hitInfo: { target: Target; isHeadshot: boolean }, clickX: number, clickY: number) {
    const { target, isHeadshot } = hitInfo;
    const now = performance.now();

    this.hits++;
    this.combo++;

    // Calculate reaction time for this target
    const reactionMs = Math.round(now - target.spawnTime);
    if (reactionMs > 0 && reactionMs < 5000) {
      this.reactionTimes.push(reactionMs);
      if (reactionMs < this.bestReactionMs) {
        this.bestReactionMs = reactionMs;
      }
    }

    // Sound effect
    if (isHeadshot) {
      this.headshots++;
      soundManager.playHeadshotDink();
    } else {
      soundManager.playHit(false);
    }

    // Points calculation
    let points = 100;
    if (isHeadshot) points = 250;
    if (this.exerciseId === 'reflex') {
      // Faster reaction yields higher score bonus!
      const speedBonus = Math.max(0, Math.round((600 - reactionMs) * 0.8));
      points += speedBonus;
    }
    // Combo multiplier
    const comboMult = Math.min(2.0, 1 + Math.floor(this.combo / 10) * 0.1);
    const finalPoints = Math.round(points * comboMult);
    this.score += finalPoints;

    // Floating text feedback
    let label = `+${finalPoints}`;
    let textColor = '#22c55e'; // Green
    if (isHeadshot) {
      label = `💥 DINK! +${finalPoints}`;
      textColor = '#fbbf24';
    } else if (this.exerciseId === 'reflex') {
      label = `${reactionMs}ms (+${finalPoints})`;
      textColor = reactionMs < 200 ? '#a855f7' : reactionMs < 280 ? '#38bdf8' : '#22c55e';
    }

    this.addFloatingText(label, clickX, clickY - 15, textColor);
    this.createExplosion(target.x, target.y, target.radius, isHeadshot ? '#fbbf24' : undefined);

    // Target logic per exercise
    if (this.exerciseId === 'target_switch') {
      target.currentHp -= 1;
      if (target.currentHp <= 0) {
        this.removeTarget(target);
        this.spawnTarget();
      }
    } else {
      // Single hit destroys target and creates another
      this.removeTarget(target);
      this.spawnTarget();
    }
  }

  private onTargetMiss(clickX: number, clickY: number) {
    this.misses++;
    this.combo = 0;
    soundManager.playMiss();

    this.addFloatingText('MISS', clickX, clickY - 10, '#ef4444');
    
    // Spark on miss
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2 + 1,
        color: '#ef4444',
        alpha: 0.8,
        decay: 0.05,
        life: 1,
      });
    }
  }

  private removeTarget(target: Target) {
    const idx = this.targets.indexOf(target);
    if (idx !== -1) {
      this.targets.splice(idx, 1);
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      vy: -1.2,
      scale: 1.0,
    });
  }

  private createExplosion(x: number, y: number, baseRadius: number, customColor?: string) {
    const theme = TARGET_THEMES[this.settings.targetTheme];
    const particleColor = customColor || theme.primary;
    const count = 18;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color: Math.random() > 0.4 ? particleColor : '#ffffff',
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        life: 1,
      });
    }

    // Expanding shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: baseRadius * 0.5,
      color: theme.border,
      alpha: 0.9,
      decay: 0.04,
      life: 1,
    });
  }

  // Spawn target appropriate for the active exercise
  private spawnTarget() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const sizeMult = this.settings.targetSizeMultiplier || 1.0;

    const margin = 80;
    const usableW = Math.max(100, width - margin * 2);
    const usableH = Math.max(100, height - margin * 2);

    let x = margin + Math.random() * usableW;
    let y = margin + Math.random() * usableH;

    // Avoid spawning directly on top of existing targets
    for (let attempt = 0; attempt < 5; attempt++) {
      let tooClose = false;
      for (const t of this.targets) {
        if (Math.hypot(x - t.x, y - t.y) < 70) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) break;
      x = margin + Math.random() * usableW;
      y = margin + Math.random() * usableH;
    }

    const now = performance.now();

    if (this.exerciseId === 'gridshot') {
      // Standard circle target
      const radius = 28 * sizeMult;
      this.targets.push({
        id: Math.random().toString(),
        x,
        y,
        radius,
        vx: 0,
        vy: 0,
        spawnTime: now,
        maxHp: 1,
        currentHp: 1,
      });
    } else if (this.exerciseId === 'microshot') {
      // Much smaller target for precise headshot micro-flicks
      const radius = 14 * sizeMult;
      this.targets.push({
        id: Math.random().toString(),
        x,
        y,
        radius,
        vx: 0,
        vy: 0,
        spawnTime: now,
        maxHp: 1,
        currentHp: 1,
      });
    } else if (this.exerciseId === 'reflex') {
      // Single target appearing after random delay
      const radius = 32 * sizeMult;
      this.targets.push({
        id: Math.random().toString(),
        x,
        y,
        radius,
        vx: 0,
        vy: 0,
        spawnTime: now,
        maxHp: 1,
        currentHp: 1,
      });
    } else if (this.exerciseId === 'tracking') {
      // Moving target with smooth velocity
      const radius = 26 * sizeMult;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.4;
      this.targets.push({
        id: Math.random().toString(),
        x,
        y,
        radius,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spawnTime: now,
        maxHp: 999999,
        currentHp: 999999,
      });
    } else if (this.exerciseId === 'target_switch') {
      // Requires multiple hits (HP bar)
      const radius = 25 * sizeMult;
      this.targets.push({
        id: Math.random().toString(),
        x,
        y,
        radius,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        spawnTime: now,
        maxHp: 3,
        currentHp: 3,
      });
    } else if (this.exerciseId === 'strafing') {
      // CS2 Model with Head and Body
      const headRadius = 16 * sizeMult;
      const bodyWidth = 36 * sizeMult;
      const bodyHeight = 70 * sizeMult;
      const strafeSpeed = 3.2;

      this.targets.push({
        id: Math.random().toString(),
        x,
        y,
        radius: bodyHeight / 2,
        isHeadshotZone: true,
        headRadius,
        bodyWidth,
        bodyHeight,
        vx: (Math.random() > 0.5 ? 1 : -1) * strafeSpeed,
        vy: 0,
        spawnTime: now,
        maxHp: 1,
        currentHp: 1,
        strafeTimer: Math.random() * 80 + 40,
        facingDirection: 1,
      });
    }
  }

  // Populate initial targets for the exercise
  private initTargets() {
    this.targets = [];

    if (this.exerciseId === 'gridshot') {
      // 3 circles always active
      for (let i = 0; i < 3; i++) {
        this.spawnTarget();
      }
    } else if (this.exerciseId === 'microshot') {
      // 2 small targets
      for (let i = 0; i < 2; i++) {
        this.spawnTarget();
      }
    } else if (this.exerciseId === 'reflex') {
      // 1 target
      this.spawnTarget();
    } else if (this.exerciseId === 'tracking') {
      // 1 tracking ball
      this.spawnTarget();
    } else if (this.exerciseId === 'target_switch') {
      // 3 HP targets
      for (let i = 0; i < 3; i++) {
        this.spawnTarget();
      }
    } else if (this.exerciseId === 'strafing') {
      // 2 strafing CS2 dummies
      for (let i = 0; i < 2; i++) {
        this.spawnTarget();
      }
    }
  }

  // Main animation / game loop
  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (!this.isPaused) {
      this.update(dt, timestamp);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, timestamp: number) {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Handle initial 3, 2, 1 Countdown
    if (this.countdownValue !== null) {
      const elapsedCountdown = (timestamp - this.countdownStartTime) / 1000;
      if (elapsedCountdown < 1) {
        if (this.countdownValue !== 3) {
          this.countdownValue = 3;
          soundManager.playCountdown(false);
        }
      } else if (elapsedCountdown < 2) {
        if (this.countdownValue !== 2) {
          this.countdownValue = 2;
          soundManager.playCountdown(false);
        }
      } else if (elapsedCountdown < 3) {
        if (this.countdownValue !== 1) {
          this.countdownValue = 1;
          soundManager.playCountdown(false);
        }
      } else if (elapsedCountdown < 3.6) {
        if (this.countdownValue !== 0) {
          this.countdownValue = 0; // GO!
          soundManager.playCountdown(true);
          this.startTime = timestamp;
          this.initTargets();
        }
      } else {
        // Countdown finished, actual round begins
        this.countdownValue = null;
        this.startTime = timestamp;
      }

      this.emitStats(0);
      return;
    }

    // Active round timing
    this.elapsedTime = (timestamp - this.startTime) / 1000;

    let timeLeft = 0;
    if (this.durationSeconds > 0) {
      timeLeft = Math.max(0, this.durationSeconds - this.elapsedTime);
      if (timeLeft <= 0) {
        // Round Finished!
        this.finishRound();
        return;
      }
    }

    // Specific tracking physics & collision
    if (this.exerciseId === 'tracking') {
      this.trackingTicksTotal++;
      let anyHit = false;

      for (const t of this.targets) {
        // Check if mouse is hovering over target
        const dist = Math.hypot(this.mouseX - t.x, this.mouseY - t.y);
        if (dist <= t.radius) {
          anyHit = true;
          this.trackingTicksHit++;
          this.score += 5; // Continuous tracking points
          
          // Emit tracking sparks
          if (Math.random() < 0.4) {
            this.particles.push({
              x: t.x + (Math.random() - 0.5) * t.radius,
              y: t.y + (Math.random() - 0.5) * t.radius,
              vx: (Math.random() - 0.5) * 1.5,
              vy: (Math.random() - 0.5) * 1.5,
              radius: Math.random() * 2 + 1,
              color: '#38bdf8',
              alpha: 0.9,
              decay: 0.05,
              life: 1,
            });
          }
        }

        // Move target smoothly
        t.x += t.vx;
        t.y += t.vy;

        // Bounce with margin
        const pad = t.radius + 30;
        if (t.x < pad) { t.x = pad; t.vx = Math.abs(t.vx); }
        if (t.x > width - pad) { t.x = width - pad; t.vx = -Math.abs(t.vx); }
        if (t.y < pad) { t.y = pad; t.vy = Math.abs(t.vy); }
        if (t.y > height - pad) { t.y = height - pad; t.vy = -Math.abs(t.vy); }

        // Dynamic random direction change (simulating human jiggle counter-strafe)
        if (Math.random() < 0.02) {
          const speed = Math.hypot(t.vx, t.vy);
          const newAngle = Math.random() * Math.PI * 2;
          t.vx = Math.cos(newAngle) * speed;
          t.vy = Math.sin(newAngle) * speed;
        }
      }

      if (anyHit) {
        if (!this.isCurrentlyTracking) {
          this.isCurrentlyTracking = true;
          soundManager.startTrackingSound();
        }
      } else {
        if (this.isCurrentlyTracking) {
          this.isCurrentlyTracking = false;
          soundManager.stopTrackingSound();
        }
      }
    }

    // Specific strafing physics (CS2 counter-strafe A-D)
    if (this.exerciseId === 'strafing') {
      for (const t of this.targets) {
        t.x += t.vx;

        // Strafe timer for direction switch
        if (t.strafeTimer !== undefined) {
          t.strafeTimer--;
          if (t.strafeTimer <= 0) {
            t.vx = -t.vx;
            t.strafeTimer = Math.floor(Math.random() * 90 + 30);
          }
        }

        const margin = (t.bodyWidth || 40) + 20;
        if (t.x < margin) {
          t.x = margin;
          t.vx = Math.abs(t.vx);
        } else if (t.x > width - margin) {
          t.x = width - margin;
          t.vx = -Math.abs(t.vx);
        }
      }
    }

    // Target switch gentle drift
    if (this.exerciseId === 'target_switch') {
      for (const t of this.targets) {
        t.x += t.vx;
        t.y += t.vy;
        if (t.x < 50 || t.x > width - 50) t.vx = -t.vx;
        if (t.y < 50 || t.y > height - 50) t.vy = -t.vy;
      }
    }

    // Reflex auto-disappear if too slow (> 1.2s without click)
    if (this.exerciseId === 'reflex') {
      const now = performance.now();
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        if (now - t.spawnTime > 1200) {
          this.misses++;
          this.combo = 0;
          this.addFloatingText('LENTO!', t.x, t.y - 15, '#f43f5e');
          this.removeTarget(t);
          // Wait random delay before spawning next reflex
          setTimeout(() => {
            if (this.isRunning && !this.isPaused && this.targets.length === 0) {
              this.spawnTarget();
            }
          }, Math.random() * 1200 + 600);
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    this.emitStats(timeLeft);
  }

  private emitStats(timeLeft: number) {
    const totalAttempts = this.hits + this.misses;
    const accuracy = totalAttempts > 0 ? Math.round((this.hits / totalAttempts) * 100) : 100;
    const kps = this.elapsedTime > 0 ? Number((this.hits / this.elapsedTime).toFixed(2)) : 0;
    
    let avgReactionMs = 0;
    if (this.reactionTimes.length > 0) {
      const sum = this.reactionTimes.reduce((a, b) => a + b, 0);
      avgReactionMs = Math.round(sum / this.reactionTimes.length);
    }

    const trackingPercent = this.trackingTicksTotal > 0
      ? Math.round((this.trackingTicksHit / this.trackingTicksTotal) * 100)
      : 0;

    const headshotPercent = this.hits > 0
      ? Math.round((this.headshots / this.hits) * 100)
      : 0;

    this.onStatsUpdate({
      score: this.score,
      timeLeft: Math.ceil(timeLeft),
      hits: this.hits,
      misses: this.misses,
      totalClicks: this.totalClicks,
      accuracy,
      kps,
      lastReactionMs: this.reactionTimes.length > 0 ? this.reactionTimes[this.reactionTimes.length - 1] : null,
      avgReactionMs,
      bestReactionMs: this.bestReactionMs === 9999 ? 0 : this.bestReactionMs,
      trackingPercent,
      headshotPercent,
      combo: this.combo,
      countdown: this.countdownValue,
    });
  }

  private finishRound() {
    this.stop();
    soundManager.playVictory();

    const totalAttempts = this.hits + this.misses;
    const accuracy = totalAttempts > 0 ? Math.round((this.hits / totalAttempts) * 100) : 100;
    const kps = this.elapsedTime > 0 ? Number((this.hits / this.elapsedTime).toFixed(2)) : 0;
    
    let avgReactionMs = 0;
    if (this.reactionTimes.length > 0) {
      const sum = this.reactionTimes.reduce((a, b) => a + b, 0);
      avgReactionMs = Math.round(sum / this.reactionTimes.length);
    }

    const trackingPercent = this.trackingTicksTotal > 0
      ? Math.round((this.trackingTicksHit / this.trackingTicksTotal) * 100)
      : 0;

    const headshotPercent = this.hits > 0
      ? Math.round((this.headshots / this.hits) * 100)
      : 0;

    // Grade Rank Calculation
    let rankGrade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'B';
    if (this.exerciseId === 'tracking') {
      if (trackingPercent >= 85) rankGrade = 'S+';
      else if (trackingPercent >= 75) rankGrade = 'S';
      else if (trackingPercent >= 60) rankGrade = 'A';
      else if (trackingPercent >= 45) rankGrade = 'B';
      else if (trackingPercent >= 30) rankGrade = 'C';
      else rankGrade = 'D';
    } else if (this.exerciseId === 'reflex') {
      if (avgReactionMs > 0 && avgReactionMs <= 185) rankGrade = 'S+';
      else if (avgReactionMs <= 215) rankGrade = 'S';
      else if (avgReactionMs <= 250) rankGrade = 'A';
      else if (avgReactionMs <= 300) rankGrade = 'B';
      else if (avgReactionMs <= 380) rankGrade = 'C';
      else rankGrade = 'D';
    } else {
      if (this.score >= 5000 && accuracy >= 95) rankGrade = 'S+';
      else if (this.score >= 3800 && accuracy >= 90) rankGrade = 'S';
      else if (this.score >= 2800 && accuracy >= 82) rankGrade = 'A';
      else if (this.score >= 1800 && accuracy >= 70) rankGrade = 'B';
      else if (this.score >= 1000) rankGrade = 'C';
      else rankGrade = 'D';
    }

    const stats: RoundStats = {
      id: Math.random().toString(36).substring(2, 9),
      exerciseId: this.exerciseId,
      exerciseTitle: this.exerciseId,
      timestamp: Date.now(),
      durationSeconds: Math.round(this.elapsedTime),
      score: this.score,
      targetsHit: this.hits,
      targetsMissed: this.misses,
      totalClicks: this.totalClicks,
      accuracy,
      kps,
      avgReactionMs,
      bestReactionMs: this.bestReactionMs === 9999 ? 0 : this.bestReactionMs,
      trackingTimePercent: trackingPercent,
      headshotPercent,
      reactionTimesHistory: [...this.reactionTimes],
      rankGrade,
    };

    this.onFinish(stats);
  }

  // Render everything onto canvas
  private render() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Tactical dark background
    this.ctx.fillStyle = '#09090b';
    this.ctx.fillRect(0, 0, width, height);

    // Subtle tactical CS2 grid lines
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    const gridSize = 48;
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Subtle central tactical ring
    this.ctx.beginPath();
    this.ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    this.ctx.stroke();

    // Render Targets
    for (const target of this.targets) {
      this.renderTarget(target);
    }

    // Render Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render Floating Texts
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.alpha);
      this.ctx.font = 'bold 15px "JetBrains Mono", monospace';
      this.ctx.fillStyle = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }

    // Render Countdown Overlay
    if (this.countdownValue !== null) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(9, 9, 11, 0.5)';
      this.ctx.fillRect(0, 0, width, height);

      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = 'bold 72px "Chakra Petch", sans-serif';
      this.ctx.fillStyle = this.countdownValue === 0 ? '#22c55e' : '#f59e0b';
      this.ctx.shadowColor = this.countdownValue === 0 ? '#22c55e' : '#f59e0b';
      this.ctx.shadowBlur = 24;

      const countdownText = this.countdownValue === 0 ? 'VAI!' : this.countdownValue.toString();
      this.ctx.fillText(countdownText, width / 2, height / 2);
      this.ctx.restore();
    }

    // Render Virtual Crosshair (when Pointer Lock is active or custom crosshair enabled)
    if (this.settings.showCrosshair && (this.settings.pointerLockMode || this.isRunning)) {
      this.renderCrosshair(this.mouseX, this.mouseY);
    }
  }

  // Draw CS2 stylized targets
  private renderTarget(target: Target) {
    const theme = TARGET_THEMES[this.settings.targetTheme];

    if (target.isHeadshotZone && target.headRadius && target.bodyWidth && target.bodyHeight) {
      // CS2 Strafe dummy (Head + Torso)
      const headY = target.y - target.bodyHeight / 2;

      // Torso (rounded rectangle)
      const bodyX = target.x - target.bodyWidth / 2;
      const bodyY = target.y - target.bodyHeight / 2 + target.headRadius;
      const bodyH = target.bodyHeight - target.headRadius;

      this.ctx.save();
      this.ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(bodyX, bodyY, target.bodyWidth, bodyH, 8);
      this.ctx.fill();
      this.ctx.stroke();

      // Chest crosshair marker
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(target.x - 8, bodyY + bodyH * 0.35, 16, 16);

      // Head (Critical Hit / Dink zone!)
      this.ctx.beginPath();
      this.ctx.arc(target.x, headY, target.headRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.shadowColor = '#ef4444';
      this.ctx.shadowBlur = 12;
      this.ctx.fill();

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#fbbf24';
      this.ctx.stroke();

      // Head center dot
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(target.x, headY, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Label "HEAD"
      this.ctx.font = 'bold 9px "JetBrains Mono", monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('HEAD', target.x, headY - target.headRadius - 4);

      this.ctx.restore();
      return;
    }

    // Standard Multi-ring Aim Circle
    this.ctx.save();

    // Outer glow
    this.ctx.shadowColor = theme.glow;
    this.ctx.shadowBlur = 16;

    // Outer Circle Fill
    const gradient = this.ctx.createRadialGradient(
      target.x, target.y, 0,
      target.x, target.y, target.radius
    );
    gradient.addColorStop(0, theme.primary);
    gradient.addColorStop(0.7, theme.secondary);
    gradient.addColorStop(1, theme.border);

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner concentric ring
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(target.x, target.y, target.radius * 0.55, 0, Math.PI * 2);
    this.ctx.stroke();

    // Bullseye center dot
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(target.x, target.y, Math.max(3, target.radius * 0.18), 0, Math.PI * 2);
    this.ctx.fill();

    // Target Switch HP Bar
    if (this.exerciseId === 'target_switch' && target.maxHp > 1) {
      const barW = target.radius * 2;
      const barH = 5;
      const barX = target.x - barW / 2;
      const barY = target.y + target.radius + 6;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(barX, barY, barW, barH);

      const fillW = (target.currentHp / target.maxHp) * barW;
      this.ctx.fillStyle = '#a855f7';
      this.ctx.fillRect(barX, barY, fillW, barH);
    }

    this.ctx.restore();
  }

  // Draw CS2 style custom crosshair
  private renderCrosshair(x: number, y: number) {
    const ch = this.settings.crosshair;
    this.ctx.save();
    this.ctx.globalAlpha = ch.opacity;

    const size = ch.size;
    const thickness = ch.thickness;
    const gap = ch.gap;

    if (ch.outline) {
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = thickness + ch.outlineThickness * 2;

      // Cross outline
      if (ch.style === 'cross' || ch.style === 'cross_dot') {
        this.ctx.beginPath();
        // Top
        this.ctx.moveTo(x, y - gap - size);
        this.ctx.lineTo(x, y - gap);
        // Bottom
        this.ctx.moveTo(x, y + gap);
        this.ctx.lineTo(x, y + gap + size);
        // Left
        this.ctx.moveTo(x - gap - size, y);
        this.ctx.lineTo(x - gap, y);
        // Right
        this.ctx.moveTo(x + gap, y);
        this.ctx.lineTo(x + gap + size, y);
        this.ctx.stroke();
      }
    }

    this.ctx.strokeStyle = ch.color;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'butt';

    if (ch.style === 'cross' || ch.style === 'cross_dot') {
      this.ctx.beginPath();
      // Top
      this.ctx.moveTo(x, y - gap - size);
      this.ctx.lineTo(x, y - gap);
      // Bottom
      this.ctx.moveTo(x, y + gap);
      this.ctx.lineTo(x, y + gap + size);
      // Left
      this.ctx.moveTo(x - gap - size, y);
      this.ctx.lineTo(x - gap, y);
      // Right
      this.ctx.moveTo(x + gap, y);
      this.ctx.lineTo(x + gap + size, y);
      this.ctx.stroke();
    }

    if (ch.centerDot || ch.style === 'dot' || ch.style === 'cross_dot' || ch.style === 'circle_dot') {
      this.ctx.fillStyle = ch.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, Math.max(1.5, thickness), 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (ch.style === 'circle_dot') {
      this.ctx.beginPath();
      this.ctx.arc(x, y, gap + size * 0.6, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }
}
