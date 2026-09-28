import React from 'react';
import { Clock, Infinity as InfinityIcon } from 'lucide-react';
import { DurationOption } from '../types/aim';

interface DurationSelectorProps {
  selectedDuration: DurationOption;
  onSelectDuration: (duration: DurationOption) => void;
}

const DURATIONS: { value: DurationOption; label: string; badge?: string }[] = [
  { value: 15, label: '15s', badge: 'Rápido' },
  { value: 30, label: '30s', badge: 'Padrão' },
  { value: 60, label: '60s', badge: 'Competitivo' },
  { value: 90, label: '90s' },
  { value: 120, label: '120s', badge: 'Resistência' },
  { value: 0, label: 'Infinito', badge: 'Livre' },
];

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onSelectDuration,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Duração do Exercício</span>
        </label>
        <span className="text-xs font-mono text-amber-400">
          {selectedDuration === 0 ? 'Modo Treino Livre (Sem Tempo)' : `${selectedDuration} Segundos`}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {DURATIONS.map((d) => {
          const isSelected = selectedDuration === d.value;
          return (
            <button
              key={d.value}
              onClick={() => onSelectDuration(d.value)}
              className={`relative py-2.5 px-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1 font-display font-bold text-base">
                {d.value === 0 ? <InfinityIcon className="w-5 h-5 text-emerald-400" /> : d.label}
              </div>
              {d.badge && (
                <span className={`text-[10px] uppercase font-mono font-medium tracking-tight mt-0.5 ${
                  isSelected ? 'text-amber-300' : 'text-zinc-500'
                }`}>
                  {d.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
