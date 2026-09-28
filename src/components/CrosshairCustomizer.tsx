import React from 'react';
import { X, Crosshair, Sparkles } from 'lucide-react';
import { CrosshairConfig } from '../types/aim';

interface CrosshairCustomizerProps {
  crosshair: CrosshairConfig;
  onChange: (updated: CrosshairConfig) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'CS2 Verde', color: '#00ff66' },
  { name: 'Ciano Neon', color: '#00ffff' },
  { name: 'Amarelo Ouro', color: '#ffd700' },
  { name: 'Branco Puro', color: '#ffffff' },
  { name: 'Vermelho Alerta', color: '#ff3333' },
  { name: 'Rosa Choque', color: '#ff00aa' },
];

export const CrosshairCustomizer: React.FC<CrosshairCustomizerProps> = ({
  crosshair,
  onChange,
  onClose,
}) => {
  const update = (field: keyof CrosshairConfig, value: unknown) => {
    onChange({ ...crosshair, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Personalizador de Mira (CS2 Crosshair)
              </h3>
              <p className="text-xs text-zinc-400">
                Ajuste tamanho, espaçamento, espessura e cores idêntico ao console do CS2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-6 bg-zinc-950 flex flex-col items-center justify-center border-b border-zinc-800 relative h-48 overflow-hidden">
          {/* Subtle grid in preview */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Target in background to test contrast */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-60 border-2 border-amber-400 absolute" />

          {/* Render Crosshair Preview */}
          <div className="relative w-24 h-24 flex items-center justify-center pointer-events-none z-10">
            {crosshair.outline && (
              <>
                {/* Top Outline */}
                <div
                  className="absolute bg-black"
                  style={{
                    width: `${crosshair.thickness + crosshair.outlineThickness * 2}px`,
                    height: `${crosshair.size + crosshair.outlineThickness * 2}px`,
                    top: `calc(50% - ${crosshair.gap + crosshair.size + crosshair.outlineThickness}px)`,
                    left: `calc(50% - ${(crosshair.thickness + crosshair.outlineThickness * 2) / 2}px)`,
                  }}
                />
                {/* Bottom Outline */}
                <div
                  className="absolute bg-black"
                  style={{
                    width: `${crosshair.thickness + crosshair.outlineThickness * 2}px`,
                    height: `${crosshair.size + crosshair.outlineThickness * 2}px`,
                    top: `calc(50% + ${crosshair.gap - crosshair.outlineThickness}px)`,
                    left: `calc(50% - ${(crosshair.thickness + crosshair.outlineThickness * 2) / 2}px)`,
                  }}
                />
                {/* Left Outline */}
                <div
                  className="absolute bg-black"
                  style={{
                    height: `${crosshair.thickness + crosshair.outlineThickness * 2}px`,
                    width: `${crosshair.size + crosshair.outlineThickness * 2}px`,
                    left: `calc(50% - ${crosshair.gap + crosshair.size + crosshair.outlineThickness}px)`,
                    top: `calc(50% - ${(crosshair.thickness + crosshair.outlineThickness * 2) / 2}px)`,
                  }}
                />
                {/* Right Outline */}
                <div
                  className="absolute bg-black"
                  style={{
                    height: `${crosshair.thickness + crosshair.outlineThickness * 2}px`,
                    width: `${crosshair.size + crosshair.outlineThickness * 2}px`,
                    left: `calc(50% + ${crosshair.gap - crosshair.outlineThickness}px)`,
                    top: `calc(50% - ${(crosshair.thickness + crosshair.outlineThickness * 2) / 2}px)`,
                  }}
                />
              </>
            )}

            {/* Crosshair Lines */}
            {/* Top */}
            <div
              className="absolute"
              style={{
                backgroundColor: crosshair.color,
                width: `${crosshair.thickness}px`,
                height: `${crosshair.size}px`,
                top: `calc(50% - ${crosshair.gap + crosshair.size}px)`,
                left: `calc(50% - ${crosshair.thickness / 2}px)`,
              }}
            />
            {/* Bottom */}
            <div
              className="absolute"
              style={{
                backgroundColor: crosshair.color,
                width: `${crosshair.thickness}px`,
                height: `${crosshair.size}px`,
                top: `calc(50% + ${crosshair.gap}px)`,
                left: `calc(50% - ${crosshair.thickness / 2}px)`,
              }}
            />
            {/* Left */}
            <div
              className="absolute"
              style={{
                backgroundColor: crosshair.color,
                height: `${crosshair.thickness}px`,
                width: `${crosshair.size}px`,
                left: `calc(50% - ${crosshair.gap + crosshair.size}px)`,
                top: `calc(50% - ${crosshair.thickness / 2}px)`,
              }}
            />
            {/* Right */}
            <div
              className="absolute"
              style={{
                backgroundColor: crosshair.color,
                height: `${crosshair.thickness}px`,
                width: `${crosshair.size}px`,
                left: `calc(50% + ${crosshair.gap}px)`,
                top: `calc(50% - ${crosshair.thickness / 2}px)`,
              }}
            />

            {/* Center Dot */}
            {crosshair.centerDot && (
              <div
                className="absolute rounded-full"
                style={{
                  backgroundColor: crosshair.color,
                  width: `${crosshair.thickness * 1.5}px`,
                  height: `${crosshair.thickness * 1.5}px`,
                  top: `calc(50% - ${(crosshair.thickness * 1.5) / 2}px)`,
                  left: `calc(50% - ${(crosshair.thickness * 1.5) / 2}px)`,
                  border: crosshair.outline ? '1px solid black' : 'none',
                }}
              />
            )}
          </div>

          <span className="text-[10px] font-mono text-zinc-400 absolute bottom-2">
            Visualização em Tempo Real com Fundo de Contraste
          </span>
        </div>

        {/* Sliders & Controls */}
        <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
          {/* Preset Colors */}
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-2">Cor da Mira</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.color}
                  onClick={() => update('color', c.color)}
                  title={c.name}
                  className={`w-7 h-7 rounded-lg border transition-transform ${
                    crosshair.color === c.color ? 'scale-110 border-white ring-2 ring-white/50' : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
              <input
                type="color"
                value={crosshair.color}
                onChange={e => update('color', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>

          {/* Size (cl_crosshairsize) */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
              <span>Tamanho das Linhas (Size)</span>
              <span className="text-amber-400">{crosshair.size}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={crosshair.size}
              onChange={e => update('size', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Gap (cl_crosshairgap) */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
              <span>Espaçamento do Centro (Gap)</span>
              <span className="text-amber-400">{crosshair.gap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={crosshair.gap}
              onChange={e => update('gap', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Thickness (cl_crosshairthickness) */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
              <span>Espessura (Thickness)</span>
              <span className="text-amber-400">{crosshair.thickness}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={crosshair.thickness}
              onChange={e => update('thickness', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Toggles: Center Dot & Outline */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={crosshair.centerDot}
                onChange={e => update('centerDot', e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-xs font-medium text-zinc-200">Ponto Central (Dot)</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={crosshair.outline}
                onChange={e => update('outline', e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span className="text-xs font-medium text-zinc-200">Contorno Preto (Outline)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              onChange({
                style: 'cross',
                size: 6,
                thickness: 2,
                gap: 3,
                color: '#00ff66',
                outline: true,
                outlineThickness: 1,
                centerDot: false,
                opacity: 1,
              });
            }}
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Restaurar CS2 Padrão</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
