import { GameSettings, PlaylistRoutine, RoundStats, ExerciseId } from '../types/aim';

const SETTINGS_KEY = 'cs2_aim_settings_v1';
const HIGHSCORES_KEY = 'cs2_aim_highscores_v1';
const PLAYLISTS_KEY = 'cs2_aim_playlists_v1';
const HISTORY_KEY = 'cs2_aim_history_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  csSensitivity: 1.25,
  mouseDpi: 800,
  targetTheme: 'cs2_gold',
  targetSizeMultiplier: 1.0,
  soundEnabled: true,
  hitsoundVolume: 0.75,
  hitsoundType: 'cs2_dink',
  gunshotSound: true,
  pointerLockMode: false,
  showCrosshair: true,
  crosshair: {
    style: 'cross',
    size: 6,
    thickness: 2,
    gap: 3,
    color: '#00ff66', // CS2 Verde Neon clássico
    outline: true,
    outlineThickness: 1,
    centerDot: false,
    opacity: 1,
  },
};

export const PRESET_PLAYLISTS: PlaylistRoutine[] = [
  {
    id: 'preset_warmup_cs2',
    name: 'Aquecimento Rápido CS2',
    description: 'Rotina de 3 minutos ideal para aquecer antes de entrar em partidas competitivas / Premier.',
    isPreset: true,
    icon: 'Flame',
    items: [
      { id: 'item_1', exerciseId: 'gridshot', durationSeconds: 30 },
      { id: 'item_2', exerciseId: 'microshot', durationSeconds: 30 },
      { id: 'item_3', exerciseId: 'reflex', durationSeconds: 30 },
      { id: 'item_4', exerciseId: 'strafing', durationSeconds: 30 },
    ],
  },
  {
    id: 'preset_pro_god',
    name: 'Rotina Pro Aim God (CS2 Premier)',
    description: 'Treino intensivo para aperfeiçoar flicks de AWP/AK, headshots perfeitos e micro-correções rápidas.',
    isPreset: true,
    icon: 'Target',
    items: [
      { id: 'item_1', exerciseId: 'reflex', durationSeconds: 30 },
      { id: 'item_2', exerciseId: 'gridshot', durationSeconds: 60 },
      { id: 'item_3', exerciseId: 'microshot', durationSeconds: 60 },
      { id: 'item_4', exerciseId: 'tracking', durationSeconds: 60 },
      { id: 'item_5', exerciseId: 'target_switch', durationSeconds: 60 },
    ],
  },
  {
    id: 'preset_tracking_strafe',
    name: 'Tracking & Combate Dinâmico',
    description: 'Focado em rastrear inimigos correndo com pistola ou fazendo jiggle peek nas esquinas.',
    isPreset: true,
    icon: 'Move',
    items: [
      { id: 'item_1', exerciseId: 'tracking', durationSeconds: 60 },
      { id: 'item_2', exerciseId: 'strafing', durationSeconds: 60 },
      { id: 'item_3', exerciseId: 'target_switch', durationSeconds: 30 },
    ],
  },
  {
    id: 'preset_reflex_speed',
    name: 'Reflexo & Tempo de Reação Puro',
    description: 'Exercício focado em diminuir seu tempo de reação em milissegundos para segurar ângulos no CS2.',
    isPreset: true,
    icon: 'Zap',
    items: [
      { id: 'item_1', exerciseId: 'reflex', durationSeconds: 30 },
      { id: 'item_2', exerciseId: 'gridshot', durationSeconds: 30 },
      { id: 'item_3', exerciseId: 'reflex', durationSeconds: 30 },
    ],
  },
];

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadPlaylists(): PlaylistRoutine[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    if (raw) {
      const userPlaylists: PlaylistRoutine[] = JSON.parse(raw);
      return [...PRESET_PLAYLISTS, ...userPlaylists.filter(p => !p.isPreset)];
    }
  } catch (e) {
    console.error('Failed to load playlists:', e);
  }
  return PRESET_PLAYLISTS;
}

export function saveUserPlaylists(playlists: PlaylistRoutine[]) {
  try {
    const userOnly = playlists.filter(p => !p.isPreset);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(userOnly));
  } catch (e) {
    console.error('Failed to save playlists:', e);
  }
}

export function loadHighscores(): Record<string, number> {
  try {
    const raw = localStorage.getItem(HIGHSCORES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load highscores:', e);
  }
  return {};
}

export function saveHighscore(exerciseId: ExerciseId, score: number): boolean {
  try {
    const scores = loadHighscores();
    const current = scores[exerciseId] || 0;
    if (score > current) {
      scores[exerciseId] = score;
      localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(scores));
      return true;
    }
  } catch (e) {
    console.error('Failed to save highscore:', e);
  }
  return false;
}

export function loadHistory(): RoundStats[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history:', e);
  }
  return [];
}

export function saveHistoryRound(stats: RoundStats) {
  try {
    const history = loadHistory();
    history.unshift(stats);
    // Keep max 50 recent records
    const trimmed = history.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save history round:', e);
  }
}
