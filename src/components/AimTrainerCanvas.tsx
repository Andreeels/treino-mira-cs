import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Pause, 
  RotateCcw, 
  XCircle, 
  Clock, 
  Crosshair, 
  Target, 
  Zap, 
  Activity, 
  Flame,
  Lock,
  Layers
} from 'lucide-react';
import { ExerciseId, GameSettings, RoundStats, PlaylistSessionProgress } from '../types/aim';
import { AimEngine, EngineStatsCallbackData } from '../game/AimEngine';
import { EXERCISES } from '../utils/constants';

interface AimTrainerCanvasProps {
  exerciseId: ExerciseId;
  durationSeconds: number;
  settings: GameSettings;
  playlistProgress: PlaylistSessionProgress | null;
  onFinishRound: (stats: RoundStats) => void;
  onExit: () => void;
}

export const AimTrainerCanvas: React.FC<AimTrainerCanvasProps> = ({
  exerciseId,
  durationSeconds,
  settings,
  playlistProgress,
  onFinishRound,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AimEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);

  // Live HUD Stats
  const [stats, setStats] = useState<EngineStatsCallbackData>({
    score: 0,
    timeLeft: durationSeconds,
    hits: 0,
    misses: 0,
    totalClicks: 0,
    accuracy: 100,
    kps: 0,
    lastReactionMs: null,
    avgReactionMs: 0,
    bestReactionMs: 0,
    trackingPercent: 0,
    headshotPercent: 0,
    combo: 0,
    countdown: 3,
  });

  const exerciseInfo = EXERCISES[exerciseId];

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new AimEngine(
      canvasRef.current,
      exerciseId,
      durationSeconds,
      settings,
      (updatedStats) => {
        setStats(updatedStats);
      },
      (finalStats) => {
        onFinishRound(finalStats);
      }
    );

    engineRef.current = engine;
    engine.start();

    // Resize observer
    const handleResize = () => {
      engine.resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Pointer Lock change listener
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvasRef.current;
      setIsPointerLocked(isLocked);
    };
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
        } catch {
          // ignore
        }
      }
    };
  }, [exerciseId, durationSeconds]);

  // Update settings in running engine
  useEffect(() => {
    engineRef.current?.updateSettings(settings);
  }, [settings]);

  // Request pointer lock if enabled
  const requestPointerLock = useCallback(() => {
    if (settings.pointerLockMode && canvasRef.current) {
      try {
        canvasRef.current.requestPointerLock();
      } catch (err) {
        console.warn('Pointer lock request failed:', err);
      }
    }
  }, [settings.pointerLockMode]);

  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    engineRef.current?.handleMouseMove(e.nativeEvent);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (settings.pointerLockMode && !isPointerLocked) {
      requestPointerLock();
    }
    engineRef.current?.handleMouseDown(e.nativeEvent);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    engineRef.current?.handleMouseUp(e.nativeEvent);
  };

  const togglePause = () => {
    if (!engineRef.current) return;
    if (isPaused) {
      engineRef.current.resume();
      setIsPaused(false);
      if (settings.pointerLockMode) {
        requestPointerLock();
      }
    } else {
      engineRef.current.pause();
      setIsPaused(true);
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
        } catch {
          // ignore
        }
      }
    }
  };

  const handleRestart = () => {
    setIsPaused(false);
    engineRef.current?.stop();
    if (canvasRef.current) {
      const engine = new AimEngine(
        canvasRef.current,
        exerciseId,
        durationSeconds,
        settings,
        (updatedStats) => setStats(updatedStats),
        (finalStats) => onFinishRound(finalStats)
      );
      engineRef.current = engine;
      engine.start();
      if (settings.pointerLockMode) {
        requestPointerLock();
      }
    }
  };

  // Keyboard shortcut: ESC or P for pause, R for restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
      } else if (e.key === 'r' || e.key === 'R') {
        if (e.ctrlKey) return;
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-4rem)] bg-zinc-950 overflow-hidden select-none">
      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Exercise Name & Playlist Step Banner */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md flex items-center gap-3 shadow-lg">
            <div
              className="w-3.5 h-3.5 rounded-full animate-pulse"
              style={{ backgroundColor: exerciseInfo.accentColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white">
                  {exerciseInfo.title}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {exerciseInfo.category}
                </span>
              </div>
              {playlistProgress && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    Etapa {playlistProgress.currentIndex + 1} de {playlistProgress.playlist.items.length}: {playlistProgress.playlist.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Time Remaining & Score Banner */}
        <div className="flex items-center gap-3">
          {/* Time Remaining */}
          <div className="px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-mono font-bold text-lg text-white">
              {durationSeconds === 0 ? '∞ LIVRE' : `${stats.timeLeft}s`}
            </span>
          </div>

          {/* Score Counter */}
          <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 backdrop-blur-md flex items-center gap-2.5 shadow-lg">
            <Target className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-display font-black text-lg text-amber-400 leading-none">
                {stats.score.toLocaleString()}
              </div>
              {stats.combo > 4 && (
                <div className="text-[10px] font-mono text-orange-400 font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>COMBO x{stats.combo}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Accuracy, KPS & Reaction Times + Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Stats Pill */}
          <div className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-xs font-mono shadow-lg">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">Precisão</span>
              <span className={`font-bold ${stats.accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.accuracy}%
              </span>
            </div>

            <div className="w-px h-6 bg-zinc-800" />

            {exerciseId === 'tracking' ? (
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Rastreamento</span>
                <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                  <Activity className="w-3 h-3" />
                  {stats.trackingPercent}%
                </span>
              </div>
            ) : exerciseId === 'strafing' ? (
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Headshots</span>
                <span className="text-rose-400 font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3" />
                  {stats.headshotPercent}%
                </span>
              </div>
            ) : (
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Reação Média</span>
                <span className="text-purple-400 font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3" />
                  {stats.avgReactionMs > 0 ? `${stats.avgReactionMs}ms` : '--'}
                </span>
              </div>
            )}

            <div className="w-px h-6 bg-zinc-800" />

            <div>
              <span className="text-zinc-500 block text-[9px] uppercase">KPS (Alvos/s)</span>
              <span className="text-white font-bold">{stats.kps}</span>
            </div>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={togglePause}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors shadow-lg"
            title="Pausar (P)"
          >
            <Pause className="w-4 h-4" />
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors shadow-lg"
            title="Reiniciar (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors shadow-lg"
            title="Encerrar Exercício"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pointer Lock Reminder (When enabled but not locked) */}
      {settings.pointerLockMode && !isPointerLocked && !isPaused && (
        <div
          onClick={requestPointerLock}
          className="absolute inset-x-0 bottom-6 mx-auto w-fit z-20 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl backdrop-blur-md flex items-center gap-2 text-xs font-mono text-amber-300 cursor-pointer shadow-xl hover:bg-amber-500/30 transition-colors"
        >
          <Lock className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Clique na tela para travar o cursor com a sensibilidade do CS2</span>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
              <Pause className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-white">Treino Pausado</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Respire fundo, relaxe a pegada do mouse e volte focado.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={togglePause}
                className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
              >
                Continuar Treino
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-semibold text-xs hover:bg-zinc-700 transition-colors"
              >
                Reiniciar Exercício
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl bg-transparent text-rose-400 font-semibold text-xs hover:bg-rose-500/10 transition-colors"
              >
                Voltar ao Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`w-full h-full block ${
          settings.pointerLockMode || settings.showCrosshair ? 'cursor-none' : 'cursor-crosshair'
        }`}
      />
    </div>
  );
};
