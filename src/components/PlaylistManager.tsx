import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Target, 
  Flame, 
  Zap, 
  Move, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { PlaylistRoutine, PlaylistItem, ExerciseId, DurationOption } from '../types/aim';
import { EXERCISES } from '../utils/constants';

interface PlaylistManagerProps {
  playlists: PlaylistRoutine[];
  onStartPlaylist: (playlist: PlaylistRoutine) => void;
  onSavePlaylists: (playlists: PlaylistRoutine[]) => void;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-5 h-5 text-orange-400" />,
  Target: <Target className="w-5 h-5 text-amber-400" />,
  Move: <Move className="w-5 h-5 text-cyan-400" />,
  Zap: <Zap className="w-5 h-5 text-rose-400" />,
};

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  onStartPlaylist,
  onSavePlaylists,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);
  
  // Custom playlist creator state
  const [customName, setCustomName] = useState<string>('Minha Rotina CS2');
  const [customDesc, setCustomDesc] = useState<string>('Rotina personalizada de treino diário');
  const [customItems, setCustomItems] = useState<PlaylistItem[]>([
    { id: '1', exerciseId: 'gridshot', durationSeconds: 30 },
    { id: '2', exerciseId: 'microshot', durationSeconds: 30 },
    { id: '3', exerciseId: 'reflex', durationSeconds: 30 },
  ]);

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  const calculateTotalTime = (items: PlaylistItem[]): string => {
    const totalSec = items.reduce((acc, curr) => acc + (curr.durationSeconds || 30), 0);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min === 0) return `${sec}s`;
    return `${min}m ${sec > 0 ? `${sec}s` : ''}`;
  };

  const handleAddItem = (exerciseId: ExerciseId) => {
    const newItem: PlaylistItem = {
      id: Math.random().toString(),
      exerciseId,
      durationSeconds: 30,
    };
    setCustomItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setCustomItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === customItems.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...customItems];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setCustomItems(next);
  };

  const handleItemDurationChange = (index: number, duration: DurationOption) => {
    setCustomItems(prev => prev.map((item, i) => i === index ? { ...item, durationSeconds: duration } : item));
  };

  const handleSaveCustomPlaylist = () => {
    if (!customName.trim() || customItems.length === 0) return;
    const newRoutine: PlaylistRoutine = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      description: customDesc.trim() || 'Rotina personalizada',
      isPreset: false,
      icon: 'Target',
      items: customItems,
    };

    const updated = [...playlists, newRoutine];
    onSavePlaylists(updated);
    setSelectedPlaylistId(newRoutine.id);
    setIsCreatingCustom(false);
  };

  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    onSavePlaylists(updated);
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(updated[0]?.id || '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <span>Playlists de Treinamento CS2</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Encadeie múltiplos exercícios sequenciais para treinar todas as valências da sua mira em uma só sessão.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingCustom(prev => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isCreatingCustom
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
          }`}
        >
          {isCreatingCustom ? (
            <span>Fechar Criador</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Criar Nova Playlist</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Playlist Creator Box */}
      {isCreatingCustom && (
        <div className="bg-zinc-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Criador de Rotina Personalizada</span>
            </h3>
            <span className="text-xs font-mono text-amber-400">
              {customItems.length} Etapas • Tempo Total: {calculateTotalTime(customItems)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Nome da Playlist</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Ex: Treino Mirage AWP & AK"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Descrição</label>
              <input
                type="text"
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
                placeholder="Ex: Focado em flick rápido e tempo de reação"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Items in the new playlist */}
          <div>
            <label className="text-[11px] font-mono text-zinc-400 block mb-2">Ordem dos Exercícios</label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {customItems.map((item, idx) => {
                const ex = EXERCISES[item.exerciseId];
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold flex items-center justify-center text-zinc-400">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-display font-bold text-white block">
                          {ex?.title || item.exerciseId}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {ex?.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={item.durationSeconds}
                        onChange={e => handleItemDurationChange(idx, Number(e.target.value) as DurationOption)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono px-2 py-1 text-amber-400 focus:outline-none"
                      >
                        <option value={15}>15 seg</option>
                        <option value={30}>30 seg</option>
                        <option value={60}>60 seg</option>
                        <option value={90}>90 seg</option>
                      </select>

                      <button
                        onClick={() => handleMoveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveItem(idx, 'down')}
                        disabled={idx === customItems.length - 1}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add exercise buttons */}
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block mb-1.5 uppercase">Adicionar Exercício:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(EXERCISES).map(ex => (
                <button
                  key={ex.id}
                  onClick={() => handleAddItem(ex.id)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:border-amber-500 hover:text-white transition-colors"
                >
                  + {ex.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              onClick={() => setIsCreatingCustom(false)}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCustomPlaylist}
              disabled={customItems.length === 0}
              className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              Salvar Playlist
            </button>
          </div>
        </div>
      )}

      {/* Main Playlist Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {playlists.map((pl) => {
          const isSelected = pl.id === selectedPlaylistId;
          const totalTime = calculateTotalTime(pl.items);

          return (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                    {PRESET_ICONS[pl.icon] || <Target className="w-5 h-5 text-amber-400" />}
                  </div>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                    pl.isPreset
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {pl.isPreset ? 'Oficial' : 'Custom'}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white mb-1">
                  {pl.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {pl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  {pl.items.length} etapas
                </span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {totalTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Playlist Detailed Overview & Start Banner */}
      {activePlaylist && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Playlist Selecionada
                </span>
                {!activePlaylist.isPreset && (
                  <button
                    onClick={() => handleDeletePlaylist(activePlaylist.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-mono ml-2"
                  >
                    Excluir
                  </button>
                )}
              </div>
              <h3 className="text-2xl font-display font-bold text-white">
                {activePlaylist.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activePlaylist.description}
              </p>
            </div>

            <button
              onClick={() => onStartPlaylist(activePlaylist)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-sm hover:bg-amber-400 shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Playlist Completa ({calculateTotalTime(activePlaylist.items)})</span>
            </button>
          </div>

          {/* Sequential Steps List */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
              Roteiro de Treinamento Passo a Passo:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {activePlaylist.items.map((item, idx) => {
                const ex = EXERCISES[item.exerciseId];
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-amber-400 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-display font-bold text-zinc-200 block truncate max-w-[120px]">
                          {ex?.title || item.exerciseId}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {ex?.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.durationSeconds}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
