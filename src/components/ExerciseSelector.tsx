import React from 'react';
import { 
  LayoutGrid, 
  Zap, 
  Activity, 
  Crosshair, 
  Repeat, 
  MoveHorizontal, 
  Trophy, 
  Play
} from 'lucide-react';
import { ExerciseId } from '../types/aim';
import { EXERCISES } from '../utils/constants';

interface ExerciseSelectorProps {
  selectedExercise: ExerciseId;
  onSelectExercise: (id: ExerciseId) => void;
  highscores: Record<string, number>;
  onStartExercise: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Activity: <Activity className="w-6 h-6" />,
  Crosshair: <Crosshair className="w-6 h-6" />,
  Repeat: <Repeat className="w-6 h-6" />,
  MoveHorizontal: <MoveHorizontal className="w-6 h-6" />,
};

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedExercise,
  onSelectExercise,
  highscores,
  onStartExercise,
}) => {
  const exercisesList = Object.values(EXERCISES);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <span>Exercícios de Precisão & Mira</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Escolha uma modalidade especializada para praticar reflexo, flicking, tracking e headshots.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {exercisesList.map((ex) => {
          const isSelected = selectedExercise === ex.id;
          const bestScore = highscores[ex.id] || 0;

          return (
            <div
              key={ex.id}
              onClick={() => onSelectExercise(ex.id)}
              className={`group relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              {/* Top Row: Icon + Category Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${ex.accentColor}18`,
                      borderColor: `${ex.accentColor}40`,
                      color: ex.accentColor,
                    }}
                  >
                    {ICON_MAP[ex.iconName] || <Crosshair className="w-6 h-6" />}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {ex.category}
                    </span>
                    {bestScore > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        {bestScore.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-display font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                  {ex.title}
                </h3>
                <p className="text-xs text-amber-500/80 font-medium mb-1.5">
                  {ex.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {ex.description}
                </p>
              </div>

              {/* Bottom Mechanic Tag + Quick Start */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[190px]">
                  {ex.badge}
                </span>

                {isSelected ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartExercise();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/25 transition-all transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar</span>
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 font-medium flex items-center gap-1">
                    Selecionar
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
