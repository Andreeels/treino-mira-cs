import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, RotateCcw, Home, Clock, Target, Zap, Activity } from 'lucide-react';
import { PlaylistSessionProgress } from '../types/aim';
import { EXERCISES } from '../utils/constants';

interface PlaylistSummaryModalProps {
  progress: PlaylistSessionProgress;
  onRestartPlaylist: () => void;
  onBackToMenu: () => void;
}

export const PlaylistSummaryModal: React.FC<PlaylistSummaryModalProps> = ({
  progress,
  onRestartPlaylist,
  onBackToMenu,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#10b981', '#a855f7', '#38bdf8', '#ef4444'],
    });
  }, []);

  const totalScore = progress.stepResults.reduce((acc, s) => acc + s.score, 0);
  const avgAccuracy = Math.round(
    progress.stepResults.reduce((acc, s) => acc + s.accuracy, 0) / (progress.stepResults.length || 1)
  );
  const totalHits = progress.stepResults.reduce((acc, s) => acc + s.targetsHit, 0);
  const totalDuration = progress.stepResults.reduce((acc, s) => acc + s.durationSeconds, 0);

  const reactionTimes = progress.stepResults
    .filter(s => s.avgReactionMs > 0)
    .map(s => s.avgReactionMs);
  const overallAvgReaction = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-b border-zinc-800 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/25 border border-amber-400">
            <Trophy className="w-8 h-8 text-zinc-950 stroke-[2.5]" />
          </div>

          <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
            Playlist Concluída com Sucesso!
          </span>
          <h2 className="text-2xl font-display font-black text-white mt-1">
            {progress.playlist.name}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Parabéns! Você finalizou todas as {progress.playlist.items.length} etapas da rotina.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Pontuação Total</span>
              <span className="text-2xl font-display font-black text-amber-400">
                {totalScore.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Média Precisão</span>
              <span className={`text-2xl font-display font-black ${avgAccuracy >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {avgAccuracy}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Alvos Abatidos</span>
              <span className="text-2xl font-display font-black text-white">
                {totalHits}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Reação Geral</span>
              <span className="text-2xl font-display font-black text-purple-400">
                {overallAvgReaction > 0 ? `${overallAvgReaction}ms` : '--'}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Desempenho por Etapa:
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {progress.stepResults.map((s, idx) => {
                const ex = EXERCISES[s.exerciseId];
                return (
                  <div
                    key={s.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold flex items-center justify-center text-zinc-400">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-display font-bold text-zinc-200">
                          {ex?.title || s.exerciseId}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 ml-2">
                          {s.durationSeconds}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-zinc-400">{s.accuracy}% prec</span>
                      <span className="text-amber-400 font-bold">{s.score.toLocaleString()} pts</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold text-[10px]">
                        {s.rankGrade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Menu</span>
          </button>

          <button
            onClick={onRestartPlaylist}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir Playlist</span>
          </button>
        </div>
      </div>
    </div>
  );
};
