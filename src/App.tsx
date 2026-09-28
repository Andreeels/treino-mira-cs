import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Target, 
  Crosshair, 
  Flame, 
  Layers, 
  Zap, 
  Activity, 
  Award, 
  Info,
  Trophy,
  ShieldCheck
} from 'lucide-react';
import { 
  ExerciseId, 
  DurationOption, 
  GameSettings, 
  RoundStats, 
  PlaylistRoutine, 
  PlaylistSessionProgress,
  User
} from './types/aim';
import { 
  loadSettings, 
  saveSettings, 
  loadHighscores, 
  saveHighscore, 
  loadPlaylists, 
  saveUserPlaylists, 
  loadHistory, 
  saveHistoryRound 
} from './utils/storage';
import { 
  getCurrentUser, 
  setCurrentUser as persistCurrentUser, 
  recordGlobalRound,
  getTrophyHolders
} from './utils/userStorage';
import { soundManager } from './utils/audio';
import { EXERCISES } from './utils/constants';

import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { ExerciseSelector } from './components/ExerciseSelector';
import { DurationSelector } from './components/DurationSelector';
import { PlaylistManager } from './components/PlaylistManager';
import { CrosshairCustomizer } from './components/CrosshairCustomizer';
import { SettingsModal } from './components/SettingsModal';
import { AimTrainerCanvas } from './components/AimTrainerCanvas';
import { ResultsModal } from './components/ResultsModal';
import { PlaylistSummaryModal } from './components/PlaylistSummaryModal';
import { StatsHistoryModal } from './components/StatsHistoryModal';
import { LeaderboardRecordsTab } from './components/LeaderboardRecordsTab';
import { AdminUsersModal } from './components/AdminUsersModal';
import { UserProfileModal } from './components/UserProfileModal';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);

  // Navigation & Screen States
  const [activeTab, setActiveTab] = useState<'practice' | 'playlists' | 'records' | 'history'>('practice');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId>('gridshot');
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(30);
  
  // Persistent configs
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [highscores, setHighscores] = useState<Record<string, number>>(loadHighscores);
  const [playlists, setPlaylists] = useState<PlaylistRoutine[]>(loadPlaylists);
  const [history, setHistory] = useState<RoundStats[]>(loadHistory);

  // Active Game State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeRoundStats, setActiveRoundStats] = useState<RoundStats | null>(null);
  const [isNewHighscore, setIsNewHighscore] = useState<boolean>(false);

  // Active Playlist State
  const [playlistProgress, setPlaylistProgress] = useState<PlaylistSessionProgress | null>(null);
  const [showPlaylistSummary, setShowPlaylistSummary] = useState<boolean>(false);

  // Modals
  const [showCrosshairModal, setShowCrosshairModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [inspectingUserId, setInspectingUserId] = useState<string | null>(null);

  // Sync settings with audio manager and storage
  useEffect(() => {
    saveSettings(settings);
    soundManager.setConfig(
      !settings.soundEnabled,
      settings.hitsoundVolume,
      settings.hitsoundType,
      settings.gunshotSound
    );
  }, [settings]);

  // Handle user logout
  const handleLogout = () => {
    persistCurrentUser(null);
    setCurrentUser(null);
    setIsPlaying(false);
    setActiveRoundStats(null);
  };

  // Start single exercise from Practice tab
  const handleStartPractice = () => {
    setPlaylistProgress(null);
    setActiveRoundStats(null);
    setIsPlaying(true);
  };

  // Start playlist routine
  const handleStartPlaylist = (playlist: PlaylistRoutine) => {
    if (playlist.items.length === 0) return;
    const progress: PlaylistSessionProgress = {
      playlist,
      currentIndex: 0,
      stepResults: [],
      isCompleted: false,
    };
    setPlaylistProgress(progress);
    setSelectedExercise(playlist.items[0].exerciseId);
    setSelectedDuration(playlist.items[0].durationSeconds);
    setActiveRoundStats(null);
    setIsPlaying(true);
  };

  // Finish round callback from AimEngine
  const handleFinishRound = (rawStats: RoundStats) => {
    setIsPlaying(false);

    // Enrich round with logged-in user credentials
    const enrichedStats: RoundStats = {
      ...rawStats,
      userId: currentUser?.id,
      username: currentUser?.username,
      userDisplayName: currentUser?.displayName,
    };
    
    // Check & save personal highscore
    const isNew = saveHighscore(enrichedStats.exerciseId, enrichedStats.score);
    setIsNewHighscore(isNew);
    if (isNew) {
      setHighscores(loadHighscores());
    }

    // Save to user history
    saveHistoryRound(enrichedStats);
    setHistory(loadHistory());

    // Record to global round database for records & trophies
    recordGlobalRound(enrichedStats);

    setActiveRoundStats(enrichedStats);

    // If inside a playlist, record step result
    if (playlistProgress) {
      const updatedSteps = [...playlistProgress.stepResults, enrichedStats];
      const isLastStep = playlistProgress.currentIndex + 1 >= playlistProgress.playlist.items.length;
      
      setPlaylistProgress({
        ...playlistProgress,
        stepResults: updatedSteps,
        isCompleted: isLastStep,
      });
    }
  };

  // Next playlist step
  const handleNextPlaylistStep = () => {
    if (!playlistProgress) return;
    const nextIndex = playlistProgress.currentIndex + 1;

    if (nextIndex < playlistProgress.playlist.items.length) {
      const nextItem = playlistProgress.playlist.items[nextIndex];
      setPlaylistProgress({
        ...playlistProgress,
        currentIndex: nextIndex,
      });
      setSelectedExercise(nextItem.exerciseId);
      setSelectedDuration(nextItem.durationSeconds);
      setActiveRoundStats(null);
      setIsPlaying(true);
    } else {
      // Completed full playlist!
      setActiveRoundStats(null);
      setShowPlaylistSummary(true);
    }
  };

  // Restart current exercise
  const handleRestartCurrent = () => {
    setActiveRoundStats(null);
    setIsPlaying(true);
  };

  // Back to menu
  const handleBackToMenu = () => {
    setIsPlaying(false);
    setActiveRoundStats(null);
    setPlaylistProgress(null);
    setShowPlaylistSummary(false);
  };

  const handleToggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleTogglePointerLock = () => {
    setSettings(prev => ({ ...prev, pointerLockMode: !prev.pointerLockMode }));
  };

  const handleClearHistory = () => {
    localStorage.removeItem('cs2_aim_history_v1');
    setHistory([]);
  };

  // If user is not authenticated, show Login / Register screen
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          persistCurrentUser(user);
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        settings={settings}
        currentUser={currentUser}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenCrosshair={() => setShowCrosshairModal(true)}
        onOpenAdminPanel={() => setShowAdminModal(true)}
        onOpenProfile={(uid) => setInspectingUserId(uid)}
        onToggleSound={handleToggleSound}
        onTogglePointerLock={handleTogglePointerLock}
        onLogout={handleLogout}
        isPlaying={isPlaying}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {isPlaying ? (
          /* Active Aim Training Canvas */
          <AimTrainerCanvas
            exerciseId={selectedExercise}
            durationSeconds={selectedDuration}
            settings={settings}
            playlistProgress={playlistProgress}
            onFinishRound={handleFinishRound}
            onExit={handleBackToMenu}
          />
        ) : (
          /* Dashboard / Tabs Container */
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
            {/* Quick Hero Banner with CS2 Highlights */}
            {activeTab === 'practice' && (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 lg:p-8 shadow-2xl">
                {/* Background glow effects */}
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Counter-Strike 2 • Aim Training Engine
                      </span>
                      <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                        Sessão de: <strong className="text-zinc-300">{currentUser.displayName}</strong>
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white tracking-tight">
                      Treine sua Mira &amp; <span className="text-amber-500">Reflexos para CS2</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      Gridshot de alta velocidade, reflexo milimétrico em milissegundos, tracking suave e micro-headshots.
                      Dispute recordes, conquiste troféus oficiais e analise perfis públicos de jogadores.
                    </p>
                  </div>

                  {/* Big Launch Button */}
                  <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      onClick={handleStartPractice}
                      className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-display font-black text-base shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 group"
                    >
                      <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                      <span>INICIAR TREINO ({selectedDuration === 0 ? 'LIVRE' : `${selectedDuration}S`})</span>
                    </button>
                  </div>
                </div>

                {/* Duration Picker Inside Hero */}
                <div className="mt-6 pt-5 border-t border-zinc-800/80">
                  <DurationSelector
                    selectedDuration={selectedDuration}
                    onSelectDuration={setSelectedDuration}
                  />
                </div>
              </div>
            )}

            {/* TAB: Prática Livre */}
            {activeTab === 'practice' && (
              <ExerciseSelector
                selectedExercise={selectedExercise}
                onSelectExercise={setSelectedExercise}
                highscores={highscores}
                onStartExercise={handleStartPractice}
              />
            )}

            {/* TAB: Playlists de Treino */}
            {activeTab === 'playlists' && (
              <PlaylistManager
                playlists={playlists}
                onStartPlaylist={handleStartPlaylist}
                onSavePlaylists={(updated) => {
                  setPlaylists(updated);
                  saveUserPlaylists(updated);
                }}
              />
            )}

            {/* TAB: Mural de Recordes & Troféus */}
            {activeTab === 'records' && (
              <LeaderboardRecordsTab
                onOpenProfile={(uid) => setInspectingUserId(uid)}
              />
            )}

            {/* TAB: Histórico & Recordes Pessoais */}
            {activeTab === 'history' && (
              <StatsHistoryModal
                history={history}
                highscores={highscores}
                onClearHistory={handleClearHistory}
              />
            )}
          </div>
        )}
      </main>

      {/* Results Modal (at the end of an exercise) */}
      {activeRoundStats && (
        <ResultsModal
          stats={activeRoundStats}
          isNewHighscore={isNewHighscore}
          playlistProgress={playlistProgress}
          onRestart={handleRestartCurrent}
          onNextPlaylistStep={playlistProgress ? handleNextPlaylistStep : undefined}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Playlist Summary Modal (at the end of full playlist) */}
      {showPlaylistSummary && playlistProgress && (
        <PlaylistSummaryModal
          progress={playlistProgress}
          onRestartPlaylist={() => handleStartPlaylist(playlistProgress.playlist)}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Crosshair Customizer Modal */}
      {showCrosshairModal && (
        <CrosshairCustomizer
          crosshair={settings.crosshair}
          onChange={(updated) => setSettings(prev => ({ ...prev, crosshair: updated }))}
          onClose={() => setShowCrosshairModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Admin Users Management Modal */}
      {showAdminModal && currentUser.role === 'admin' && (
        <AdminUsersModal
          currentUser={currentUser}
          onClose={() => setShowAdminModal(false)}
          onUsersUpdated={() => {
            // refresh current user if modified
            const updated = getCurrentUser();
            if (updated) setCurrentUser(updated);
          }}
        />
      )}

      {/* Public User Profile Inspector Modal */}
      {inspectingUserId && (
        <UserProfileModal
          initialUserId={inspectingUserId}
          onClose={() => setInspectingUserId(null)}
          onSelectUserToView={(uid) => setInspectingUserId(uid)}
        />
      )}
    </div>
  );
};

export default App;
