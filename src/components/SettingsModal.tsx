import React from 'react';
import { X, Settings, Volume2, Target, Crosshair, Lock, MousePointer, Info } from 'lucide-react';
import { GameSettings, TargetThemeId } from '../types/aim';
import { TARGET_THEMES } from '../utils/constants';

interface SettingsModalProps {
  settings: GameSettings;
  onChange: (updated: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onChange,
  onClose,
}) => {
  const update = <K extends keyof GameSettings>(field: K, value: GameSettings[K]) => {
    onChange({ ...settings, [field]: value });
  };

  const eDpi = Math.round(settings.csSensitivity * settings.mouseDpi);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Configurações & Sensibilidade CS2
              </h3>
              <p className="text-xs text-zinc-400">
                Ajuste sua sensibilidade real de Counter-Strike 2, eDPI, áudio e temas
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

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* CS2 Sensitivity & DPI Section */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                  Calibração de Sensibilidade CS2
                </span>
              </div>
              <div className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                eDPI: {eDpi}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Sensibilidade no CS2 (In-game)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="10"
                    value={settings.csSensitivity}
                    onChange={e => update('csSensitivity', Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  DPI do Mouse
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={settings.mouseDpi}
                    onChange={e => update('mouseDpi', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={400}>400 DPI (CS Clássico)</option>
                    <option value={800}>800 DPI (Padrão Pro)</option>
                    <option value={1200}>1200 DPI</option>
                    <option value={1600}>1600 DPI (Moderno)</option>
                    <option value={3200}>3200 DPI</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pointer Lock Mode Explanation */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pointerLockMode}
                  onChange={e => update('pointerLockMode', e.target.checked)}
                  className="mt-0.5 accent-amber-500 rounded"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    {settings.pointerLockMode ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <MousePointer className="w-3.5 h-3.5 text-zinc-400" />}
                    <span>Ativar Modo Trava do Cursor (Sensibilidade CS2 Real)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Prende o ponteiro do mouse ao clicar no treino, aplicando o multiplicador exato da sua sensibilidade do CS2. (Pressione ESC a qualquer momento para liberar o cursor).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Target Theme & Sizing */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Aparência & Tamanho dos Alvos
              </span>
            </div>

            {/* Target Themes */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-2">Tema de Cores dos Círculos</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(TARGET_THEMES) as [TargetThemeId, typeof TARGET_THEMES[TargetThemeId]][]).map(([key, t]) => {
                  const isSelected = settings.targetTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => update('targetTheme', key)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-500 ring-1 ring-amber-500/50'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span className="text-xs font-medium text-zinc-200 truncate">{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Size Multiplier */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1.5">
                <span>Dificuldade do Tamanho do Alvo</span>
                <span className="text-amber-400 font-bold">
                  {settings.targetSizeMultiplier === 0.8
                    ? '0.8x (Difícil / Preciso)'
                    : settings.targetSizeMultiplier === 1.2
                    ? '1.2x (Fácil)'
                    : '1.0x (Padrão Competitivo)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Pequeno (0.8x)', value: 0.8 },
                  { label: 'Padrão (1.0x)', value: 1.0 },
                  { label: 'Grande (1.2x)', value: 1.2 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => update('targetSizeMultiplier', opt.value)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                      settings.targetSizeMultiplier === opt.value
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio & Feedback Section */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Efeitos Sonoros & Feedback Tático
              </span>
            </div>

            {/* Hitsound Type */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-2">Som de Acerto (Hitsound)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'cs2_dink', label: '💥 CS2 Dink Metálico' },
                  { id: 'pop', label: '🔘 Pop Moderno' },
                  { id: 'arcade', label: '🕹️ Arcade Chime' },
                  { id: 'bell', label: '🔔 Sino Claro' },
                ].map(snd => (
                  <button
                    key={snd.id}
                    onClick={() => update('hitsoundType', snd.id as GameSettings['hitsoundType'])}
                    className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                      settings.hitsoundType === snd.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {snd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gunshot sound & Volume */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gunshotSound}
                  onChange={e => update('gunshotSound', e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span className="text-xs text-zinc-300">Som de disparo de tiro (AK-47 / Deagle) ao clicar</span>
              </label>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                  <span>Volume Geral dos Efeitos</span>
                  <span className="text-amber-400">{Math.round(settings.hitsoundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.hitsoundVolume}
                  onChange={e => update('hitsoundVolume', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300/90">
            <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Suas preferências de sensibilidade CS2, mira personalizada e temas são salvas automaticamente na memória do seu navegador.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20"
          >
            Salvar & Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
