import React from 'react';
import { History, Trophy, Trash2, Calendar, Target, Zap, Clock } from 'lucide-react';
import { RoundStats, ExerciseId } from '../types/aim';
import { EXERCISES } from '../utils/constants';

interface StatsHistoryModalProps {
  history: RoundStats[];
  highscores: Record<string, number>;
  onClearHistory: () => void;
}

export const StatsHistoryModal: React.FC<StatsHistoryModalProps> = ({
  history,
  highscores,
  onClearHistory,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = React.useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Top banner: Personal Bests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Recordes Pessoais (Highscores)</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Sua pontuação máxima registrada em cada uma das modalidades de treino.
            </p>
          </div>

          {history.length > 0 && (
            isConfirmingClear ? (
              <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-rose-500/40 rounded-xl">
                <span className="text-[11px] text-rose-400 font-mono px-2">Limpar tudo?</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setIsConfirmingClear(false);
                  }}
                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Sim
                </button>
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(EXERCISES) as ExerciseId[]).map((id) => {
            const ex = EXERCISES[id];
            const score = highscores[id] || 0;
            return (
              <div
                key={id}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">{ex.category}</span>
                  <span className="font-display font-bold text-sm text-white">{ex.title}</span>
                </div>
                <div className="text-right">
                  <span className="font-display font-black text-xl text-amber-400 block">
                    {score > 0 ? score.toLocaleString() : '--'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">PONTOS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions History */}
      <div>
        <h3 className="text-base font-display font-bold text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <span>Histórico de Treinos Recentes ({history.length})</span>
        </h3>

        {history.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-950/50 border border-zinc-800/60">
            <Target className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-400 font-medium">Nenhum treino registrado ainda</p>
            <p className="text-xs text-zinc-600 mt-1">
              Complete um exercício ou uma playlist para acompanhar sua evolução diária de mira.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {history.map((h) => {
              const ex = EXERCISES[h.exerciseId];
              const dateStr = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={h.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 font-display font-black text-amber-400 flex items-center justify-center text-sm">
                      {h.rankGrade}
                    </span>
                    <div>
                      <span className="font-display font-bold text-white text-sm block">
                        {ex?.title || h.exerciseId}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {h.durationSeconds}s
                        </span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-zinc-400 block">{h.accuracy}% precisão</span>
                      <span className="text-[10px] text-zinc-500">{h.kps} alvos/s</span>
                    </div>

                    {h.avgReactionMs > 0 && (
                      <div className="text-right">
                        <span className="text-purple-400 font-bold block">{h.avgReactionMs}ms</span>
                        <span className="text-[10px] text-zinc-500">reação média</span>
                      </div>
                    )}

                    <div className="text-right pl-2 border-l border-zinc-800">
                      <span className="font-display font-bold text-amber-400 text-sm block">
                        {h.score.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-zinc-500">PONTOS</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
