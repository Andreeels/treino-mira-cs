import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Target, 
  Activity, 
  Award,
  Layers,
  Home
} from 'lucide-react';
import { RoundStats, PlaylistSessionProgress } from '../types/aim';
import { EXERCISES } from '../utils/constants';

interface ResultsModalProps {
  stats: RoundStats;
  isNewHighscore: boolean;
  playlistProgress: PlaylistSessionProgress | null;
  onRestart: () => void;
  onNextPlaylistStep?: () => void;
  onBackToMenu: () => void;
}

const RANK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'S+': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-400' },
  'S': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-400' },
  'A': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-400' },
  'B': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-400' },
  'C': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-400' },
  'D': { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-400' },
};

export const ResultsModal: React.FC<ResultsModalProps> = ({
  stats,
  isNewHighscore,
  playlistProgress,
  onRestart,
  onNextPlaylistStep,
  onBackToMenu,
}) => {
  const exercise = EXERCISES[stats.exerciseId];
  const rankStyle = RANK_COLORS[stats.rankGrade] || RANK_COLORS['B'];

  useEffect(() => {
    if (isNewHighscore || stats.rankGrade === 'S+' || stats.rankGrade === 'S') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#a855f7', '#38bdf8'],
      });
    }
  }, [isNewHighscore, stats.rankGrade]);

  const hasNextPlaylistStep = playlistProgress && (playlistProgress.currentIndex + 1 < playlistProgress.playlist.items.length);
  const nextItem = hasNextPlaylistStep ? playlistProgress.playlist.items[playlistProgress.currentIndex + 1] : null;
  const nextExercise = nextItem ? EXERCISES[nextItem.exerciseId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Banner with Rank & Score */}
        <div className="p-6 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-b border-zinc-800 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* New Highscore Pill */}
          {isNewHighscore && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase mb-3 animate-pulse">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Novo Recorde Pessoal!</span>
            </div>
          )}

          {/* Rank Badge */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-display font-black text-3xl shadow-xl ${rankStyle.bg} ${rankStyle.border} ${rankStyle.text}`}>
              {stats.rankGrade}
            </div>
            <div className="text-left">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {exercise?.title || stats.exerciseId} • {stats.durationSeconds}s
              </div>
              <div className="text-3xl font-display font-black text-white leading-none mt-0.5">
                {stats.score.toLocaleString()} <span className="text-xs font-mono text-amber-400 font-normal">PTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Accuracy */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Precisão</span>
              <span className={`text-xl font-display font-bold ${stats.accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.accuracy}%
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                {stats.targetsHit} / {stats.totalClicks} tiros
              </span>
            </div>

            {/* KPS */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Velocidade</span>
              <span className="text-xl font-display font-bold text-white">
                {stats.kps}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Alvos / segundo</span>
            </div>

            {/* Reaction or Tracking or Headshot */}
            {stats.exerciseId === 'tracking' ? (
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Rastreio</span>
                <span className="text-xl font-display font-bold text-cyan-400 flex items-center justify-center gap-1">
                  <Activity className="w-4 h-4" />
                  {stats.trackingTimePercent}%
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Tempo sob mira</span>
              </div>
            ) : stats.exerciseId === 'strafing' ? (
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Headshots</span>
                <span className="text-xl font-display font-bold text-rose-400 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  {stats.headshotPercent}%
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Dink na cabeça</span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Reação Média</span>
                <span className="text-xl font-display font-bold text-purple-400 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4" />
                  {stats.avgReactionMs > 0 ? `${stats.avgReactionMs}ms` : '--'}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Tempo de resposta</span>
              </div>
            )}

            {/* Best Reaction */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Melhor Reação</span>
              <span className="text-xl font-display font-bold text-emerald-400">
                {stats.bestReactionMs > 0 ? `${stats.bestReactionMs}ms` : '--'}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Pique mais rápido</span>
            </div>
          </div>

          {/* Playlist Next Step Banner if in Playlist Mode */}
          {hasNextPlaylistStep && nextExercise && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-sm">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                    Próxima Etapa ({playlistProgress.currentIndex + 2} de {playlistProgress.playlist.items.length})
                  </span>
                  <span className="text-xs font-display font-bold text-white">
                    {nextExercise.title} ({nextItem?.durationSeconds}s)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onBackToMenu}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>

          {hasNextPlaylistStep && onNextPlaylistStep ? (
            <button
              onClick={onNextPlaylistStep}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/25 transition-all"
            >
              <span>Continuar Playlist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onBackToMenu}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
