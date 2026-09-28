import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Zap, 
  Target, 
  Activity, 
  Clock, 
  User as UserIcon, 
  Search,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ExerciseId } from '../types/aim';
import { getGlobalRounds, getTrophyHolders, getUsers } from '../utils/userStorage';
import { EXERCISES } from '../utils/constants';

interface LeaderboardRecordsTabProps {
  onOpenProfile: (userId: string) => void;
}

export const LeaderboardRecordsTab: React.FC<LeaderboardRecordsTabProps> = ({
  onOpenProfile,
}) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<ExerciseId>('gridshot');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const allRounds = getGlobalRounds();
  const trophyHolders = getTrophyHolders();
  const users = getUsers();

  const currentExercise = EXERCISES[selectedExerciseId];
  const topHolder = trophyHolders[selectedExerciseId];

  // Get and sort all rounds for this exercise
  const exerciseRounds = allRounds
    .filter(r => r.exerciseId === selectedExerciseId && r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Group by user so each user appears only with their best record
  const uniqueUserRecordsMap = new Map<string, typeof exerciseRounds[0]>();
  for (const r of exerciseRounds) {
    const uid = r.userId || 'anon';
    if (!uniqueUserRecordsMap.has(uid) || r.score > (uniqueUserRecordsMap.get(uid)?.score || 0)) {
      uniqueUserRecordsMap.set(uid, r);
    }
  }

  const sortedLeaderboard = Array.from(uniqueUserRecordsMap.values())
    .sort((a, b) => b.score - a.score)
    .filter(r => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (r.userDisplayName || '').toLowerCase().includes(q) || (r.username || '').toLowerCase().includes(q);
    });

  // Calculate trophy count leaders
  const userTrophyCounts: Record<string, number> = {};
  Object.values(trophyHolders).forEach(holder => {
    if (holder?.user?.id && (holder.round?.score || 0) > 0) {
      userTrophyCounts[holder.user.id] = (userTrophyCounts[holder.user.id] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Mural de Recordes &amp; Troféus CS2</span>
          </h2>
          <p className="text-xs text-zinc-400">
            O jogador que alcançar a maior pontuação em cada atividade fica em destaque e recebe o troféu oficial no seu perfil.
          </p>
        </div>

        {/* Global Trophy Holders Summary Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {Object.entries(userTrophyCounts).length === 0 ? (
            <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800">
              Nenhum troféu conquistado ainda • Treine para registrar o 1º recorde!
            </div>
          ) : (
            Object.entries(userTrophyCounts).map(([uid, count]) => {
              const u = users.find(x => x.id === uid);
              if (!u) return null;
              return (
                <button
                  key={uid}
                  onClick={() => onOpenProfile(uid)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400 hover:bg-amber-500/20 transition-all shrink-0"
                >
                  <span>{u.avatar || '🏆'}</span>
                  <span className="font-bold">{u.displayName}</span>
                  <span className="bg-amber-500 text-zinc-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {count} 🏆
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Activity Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {(Object.keys(EXERCISES) as ExerciseId[]).map((exId) => {
          const ex = EXERCISES[exId];
          const isSelected = selectedExerciseId === exId;
          const holder = trophyHolders[exId];

          return (
            <button
              key={exId}
              onClick={() => setSelectedExerciseId(exId)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                  {ex.category}
                </span>
                <h4 className="font-display font-bold text-xs text-white truncate">
                  {ex.title}
                </h4>
              </div>

              {holder?.user && (holder.round?.score || 0) > 0 ? (
                <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-amber-400">
                  <span className="truncate max-w-[80px]">🏆 {holder.user.displayName}</span>
                  <span className="font-bold">{holder.round?.score.toLocaleString()}</span>
                </div>
              ) : (
                <span className="text-[10px] text-zinc-600 font-mono mt-2 block">
                  Sem recorde
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Spotlight #1 Recordist Hero Card */}
      {topHolder && topHolder.user && (topHolder.round?.score || 0) > 0 ? (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500/20 via-orange-600/10 to-zinc-950 border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
          {/* Subtle gold glow background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              {/* Massive Golden Trophy Icon with Glow */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center text-zinc-950 shadow-2xl shadow-amber-500/40 border-2 border-amber-300 shrink-0 animate-bounce">
                <Trophy className="w-10 h-10 fill-current stroke-[1.5]" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Líder Atual &amp; Dono do Troféu Oficial
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {currentExercise.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">{topHolder.user.avatar || '🎯'}</span>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                    {topHolder.user.displayName}
                  </h3>
                  <span className="text-xs font-mono text-zinc-500">
                    @{topHolder.user.username}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 max-w-lg">
                  Detém o recorde número 1 em <strong>{currentExercise.title}</strong> com o troféu dourado em exibição em seu perfil!
                </p>
              </div>
            </div>

            {/* Score & Profile Button */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800">
              <div className="text-left md:text-right">
                <span className="text-3xl sm:text-4xl font-display font-black text-amber-400 block leading-none">
                  {topHolder.round?.score.toLocaleString()} <span className="text-sm font-mono text-amber-300 font-normal">PTS</span>
                </span>
                <span className="text-xs font-mono text-zinc-400 mt-1 block">
                  {topHolder.round?.accuracy}% precisão • {topHolder.round?.kps} alvos/s
                </span>
              </div>

              <button
                onClick={() => onOpenProfile(topHolder.user!.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all transform active:scale-95"
              >
                <span>Ver Perfil &amp; Troféus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-zinc-950/60 border border-zinc-800 text-center">
          <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
          <h3 className="font-display font-bold text-white text-base">Nenhum recorde registrado nesta modalidade ainda</h3>
          <p className="text-xs text-zinc-500 mt-1">Seja o primeiro a jogar {currentExercise.title} e conquiste o troféu dourado!</p>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Table Top Controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Tabela de Classificação: {currentExercise.title}
            </h3>
            <p className="text-xs text-zinc-400">
              Clique em qualquer jogador para inspecionar o perfil completo e métricas de treino
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Buscar jogador no ranking..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Rows */}
        {sortedLeaderboard.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            Nenhum resultado encontrado no ranking.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {sortedLeaderboard.map((round, idx) => {
              const position = idx + 1;
              const isTop1 = position === 1;
              const isTop2 = position === 2;
              const isTop3 = position === 3;

              return (
                <div
                  key={round.id || idx}
                  onClick={() => round.userId && onOpenProfile(round.userId)}
                  className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isTop1
                      ? 'bg-amber-500/5 hover:bg-amber-500/10'
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Position Badge & Player Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0">
                      {isTop1 ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Trophy className="w-5 h-5 fill-current" />
                        </div>
                      ) : isTop2 ? (
                        <div className="w-9 h-9 rounded-xl bg-zinc-300 text-zinc-950 flex items-center justify-center font-bold">
                          2º
                        </div>
                      ) : isTop3 ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold">
                          3º
                        </div>
                      ) : (
                        <span className="text-zinc-500 font-mono font-bold">
                          #{position}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <span>{round.userDisplayName || round.username}</span>
                          {isTop1 && (
                            <span className="text-amber-400 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30">
                              🏆 Top 1
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          @{round.username}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-0.5">
                        <span>Precisão: <strong className="text-zinc-300">{round.accuracy}%</strong></span>
                        <span>•</span>
                        <span>KPS: <strong className="text-zinc-300">{round.kps}</strong></span>
                        {round.avgReactionMs > 0 && (
                          <>
                            <span>•</span>
                            <span>Reação: <strong className="text-purple-400">{round.avgReactionMs}ms</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score & Profile Link Indicator */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-display font-black text-lg sm:text-xl text-amber-400 block leading-none">
                        {round.score.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {round.rankGrade} Rank
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (round.userId) onOpenProfile(round.userId);
                      }}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Ver Perfil"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
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
