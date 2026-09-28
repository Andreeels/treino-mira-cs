import React from 'react';
import { 
  Target, 
  ListOrdered, 
  History, 
  Settings, 
  Crosshair, 
  Volume2, 
  VolumeX, 
  MousePointer, 
  Lock, 
  Trophy, 
  Users, 
  LogOut, 
  Shield, 
  Crown 
} from 'lucide-react';
import { GameSettings, User } from '../types/aim';

interface NavbarProps {
  activeTab: 'practice' | 'playlists' | 'records' | 'history';
  onSelectTab: (tab: 'practice' | 'playlists' | 'records' | 'history') => void;
  settings: GameSettings;
  currentUser: User;
  onOpenSettings: () => void;
  onOpenCrosshair: () => void;
  onOpenAdminPanel: () => void;
  onOpenProfile: (userId: string) => void;
  onToggleSound: () => void;
  onTogglePointerLock: () => void;
  onLogout: () => void;
  isPlaying: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  settings,
  currentUser,
  onOpenSettings,
  onOpenCrosshair,
  onOpenAdminPanel,
  onOpenProfile,
  onToggleSound,
  onTogglePointerLock,
  onLogout,
  isPlaying,
}) => {
  const eDpi = Math.round(settings.csSensitivity * settings.mouseDpi);

  return (
    <header className="h-16 bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between z-30 select-none">
      {/* Brand & CS2 Badge */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 shrink-0">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-base sm:text-xl tracking-wider text-white">
              CS2 <span className="text-amber-500">AIM LAB</span>
            </h1>
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded hidden sm:inline-block">
              FPS Trainer
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono hidden md:block">
            eDPI: <span className="text-amber-400 font-bold">{eDpi}</span> ({settings.csSensitivity} sens @ {settings.mouseDpi} DPI)
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      {!isPlaying && (
        <nav className="hidden md:flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => onSelectTab('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Treino</span>
          </button>

          <button
            onClick={() => onSelectTab('playlists')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'playlists'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>

          <button
            onClick={() => onSelectTab('records')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'records'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Recordes &amp; Troféus</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico</span>
          </button>
        </nav>
      )}

      {/* Right User & Tools Section */}
      <div className="flex items-center gap-2">
        {/* Admin Management Button (Only if user has admin role) */}
        {currentUser.role === 'admin' && !isPlaying && (
          <button
            onClick={onOpenAdminPanel}
            title="Painel de Administração de Usuários"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 hover:bg-purple-500/25 text-xs font-mono font-bold transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Gerenciar Usuários</span>
          </button>
        )}

        {/* User Profile Pill */}
        <button
          onClick={() => onOpenProfile(currentUser.id)}
          title="Ver Meu Perfil Público"
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-left transition-colors"
        >
          <span className="text-base">{currentUser.avatar || '🎯'}</span>
          <div className="hidden sm:block">
            <span className="text-xs font-display font-bold text-white block leading-tight truncate max-w-[100px]">
              {currentUser.displayName}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 leading-tight block">
              {currentUser.isMasterAdmin ? 'Admin Principal' : currentUser.role === 'admin' ? 'Admin' : 'Jogador'}
            </span>
          </div>
        </button>

        {/* Crosshair Customizer */}
        <button
          onClick={onOpenCrosshair}
          title="Personalizar Mira (Crosshair CS2)"
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
        >
          <Crosshair className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          title={settings.soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Configurações Gerais & Sensibilidade"
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Sair da Conta (Logout)"
          className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
