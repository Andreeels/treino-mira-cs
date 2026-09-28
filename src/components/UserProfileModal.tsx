import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Trophy, 
  Clock, 
  Target, 
  Zap, 
  Activity, 
  Crown, 
  ShieldCheck, 
  Calendar, 
  Flame, 
  MousePointer,
  BarChart3,
  Award
} from 'lucide-react';
import { User, ExerciseId } from '../types/aim';
import { getUsers, getUserActivitySummary } from '../utils/userStorage';
import { EXERCISES } from '../utils/constants';

interface UserProfileModalProps {
  initialUserId: string;
  onClose: () => void;
  onSelectUserToView?: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  initialUserId,
  onClose,
}) => {
  const users = useMemo(() => getUsers(), []);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const targetUser = users.find(u => u.id === selectedUserId) || users[0];
  const summary = useMemo(() => {
    if (!targetUser) return null;
    return getUserActivitySummary(targetUser.id);
  }, [targetUser]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      u.displayName.toLowerCase().includes(q) || 
      u.username.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Format time in hours and minutes
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}min`;
    if (mins > 0) return `${mins}min ${secs}s`;
    return `${secs}s`;
  };

  if (!targetUser || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Search & Navigation Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pesquisar perfil de jogador cadastrado..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />

            {/* Search Dropdown Results */}
            {filteredUsers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-30 max-h-48 overflow-y-auto">
                {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setSearchQuery('');
                    }}
                    className="w-full p-2.5 flex items-center justify-between text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{u.avatar}</span>
                      <span className="text-xs font-bold text-white">{u.displayName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">@{u.username}</span>
                    </div>
                    {u.isMasterAdmin ? (
                      <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Admin Principal
                      </span>
                    ) : u.role === 'admin' ? (
                      <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Hero Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-950 to-zinc-900 border border-zinc-800/80">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shadow-xl">
                {targetUser.avatar || '🎯'}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-display font-black text-white">
                    {targetUser.displayName}
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">
                    @{targetUser.username}
                  </span>

                  {targetUser.isMasterAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Crown className="w-3 h-3 text-amber-400" />
                      Admin Principal
                    </span>
                  )}
                  {!targetUser.isMasterAdmin && targetUser.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>

                {targetUser.bio && (
                  <p className="text-xs text-zinc-400 mt-1 max-w-md">
                    {targetUser.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-amber-500" />
                    Sens CS2: <strong className="text-zinc-300">{targetUser.csSensitivity || 1.25}</strong> @ {targetUser.mouseDpi || 800} DPI
                  </span>
                </div>
              </div>
            </div>

            {/* Total Trophies Count Badge */}
            <div className="sm:text-right shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{summary.trophiesWon.length} {summary.trophiesWon.length === 1 ? 'Troféu #1' : 'Troféus #1'}</span>
              </div>
            </div>
          </div>

          {/* Troféus de 1º Lugar (Destaque Exclusivo de Recordista) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5 tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Estante de Troféus de 1º Lugar (Recordes Mundiais)</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                Líder Absoluto na Atividade
              </span>
            </div>

            {summary.trophiesWon.length === 0 ? (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center">
                <Award className="w-8 h-8 text-zinc-700 mx-auto mb-1" />
                <p className="text-xs text-zinc-400 font-medium">Nenhum troféu de 1º lugar conquistado ainda</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Bata o recorde de uma atividade na aba de recordes para conquistar um troféu dourado em seu perfil!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {summary.trophiesWon.map((exId) => {
                  const ex = EXERCISES[exId];
                  const highscore = summary.highscores[exId] || 0;
                  return (
                    <div
                      key={exId}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-zinc-950 border border-amber-500/40 flex items-center justify-between shadow-lg shadow-amber-500/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md shadow-amber-500/30">
                          <Trophy className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                            🏆 Top 1 Recordista
                          </span>
                          <span className="font-display font-bold text-sm text-white">
                            {ex?.title || exId}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-black text-base text-amber-400 block">
                          {highscore.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">PONTOS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Metrics (Tempo de atividade, precisão, reação) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                Tempo de Treino
              </span>
              <span className="text-xl font-display font-black text-white mt-0.5 block">
                {formatTime(summary.totalTrainingTimeSeconds)}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                {summary.totalRounds} sessões
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-emerald-500" />
                Precisão Geral
              </span>
              <span className={`text-xl font-display font-black mt-0.5 block ${summary.overallAccuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {summary.overallAccuracy}%
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                {summary.totalTargetsHit.toLocaleString()} alvos
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                Reação Média
              </span>
              <span className="text-xl font-display font-black text-purple-400 mt-0.5 block">
                {summary.avgReactionMs > 0 ? `${summary.avgReactionMs}ms` : '--'}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Tempo resposta
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                Melhor Pique
              </span>
              <span className="text-xl font-display font-black text-orange-400 mt-0.5 block">
                {summary.bestReactionMs > 0 ? `${summary.bestReactionMs}ms` : '--'}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Reflexo máximo
              </span>
            </div>
          </div>

          {/* Atividades que ele Mais Faz (Frequência & Dedicação) */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5 tracking-wider">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Atividades Mais Praticadas pelo Jogador</span>
            </h3>

            <div className="space-y-2">
              {(Object.keys(EXERCISES) as ExerciseId[]).map((exId) => {
                const ex = EXERCISES[exId];
                const count = summary.exerciseCounts[exId] || 0;
                const isFavorite = summary.mostPlayedExercise === exId && count > 0;
                const pct = summary.totalRounds > 0 ? Math.round((count / summary.totalRounds) * 100) : 0;
                const best = summary.highscores[exId] || 0;

                return (
                  <div
                    key={exId}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white">
                          {ex.title}
                        </span>
                        {isFavorite && (
                          <span className="text-[9px] font-mono font-bold uppercase text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                            ★ Mais Praticada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-zinc-500">{count} vezes ({pct}%)</span>
                        <span className="text-amber-400 font-bold">Recorde: {best > 0 ? best.toLocaleString() : '--'}</span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: ex.accentColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono">
            Perfil Público • Disponível para consulta por qualquer usuário
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
