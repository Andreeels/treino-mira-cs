export type ExerciseId = 
  | 'gridshot'        // Círculos dinâmicos em grade / flicking rápido (o clássico de círculos surgindo e clicando)
  | 'reflex'          // Tempo de reação puro em milissegundos
  | 'tracking'        // Acompanhar alvo com movimento orgânico contínuo
  | 'microshot'       // Alvos minúsculos de cabeça para micro-ajustes
  | 'target_switch'   // Troca rápida de alvos resistentes (spray transfer)
  | 'strafing';       // Alvos simulando jogadores de CS2 fazendo A-D strafe e jiggle peek

export type DurationOption = 15 | 30 | 60 | 90 | 120 | 0; // 0 = Modo Livre / Infinito

export type TargetThemeId = 'cs2_gold' | 'neon_cyan' | 'acid_green' | 'hot_pink' | 'crimson';

export interface ExerciseInfo {
  id: ExerciseId;
  title: string;
  subtitle: string;
  description: string;
  category: 'Flicking' | 'Reflexo' | 'Tracking' | 'Precisão' | 'Dinâmico';
  badge: string;
  iconName: string;
  accentColor: string;
  mechanicsDescription: string;
}

export interface CrosshairConfig {
  style: 'cross' | 'dot' | 'circle_dot' | 'cross_dot';
  size: number;        // Tamanho das linhas (px)
  thickness: number;   // Espessura (px)
  gap: number;         // Espaço do centro (px)
  color: string;       // Hex ou rgba
  outline: boolean;    // Contorno preto tático
  outlineThickness: number;
  centerDot: boolean;
  opacity: number;
}

export interface GameSettings {
  csSensitivity: number;       // Sensibilidade no CS2 (ex: 1.25)
  mouseDpi: number;            // DPI do mouse (ex: 800)
  targetTheme: TargetThemeId;
  targetSizeMultiplier: number; // 0.8 (difícil), 1.0 (padrão), 1.2 (fácil)
  soundEnabled: boolean;
  hitsoundVolume: number;      // 0 a 1
  hitsoundType: 'cs2_dink' | 'pop' | 'arcade' | 'bell';
  gunshotSound: boolean;
  pointerLockMode: boolean;    // Modo Mira Virtual com Pointer Lock (sensibilidade CS2 real) vs Cursor Direto
  showCrosshair: boolean;
  crosshair: CrosshairConfig;
}

export interface RoundStats {
  id: string;
  userId?: string;
  username?: string;
  userDisplayName?: string;
  exerciseId: ExerciseId;
  exerciseTitle: string;
  timestamp: number;
  durationSeconds: number;
  score: number;
  targetsHit: number;
  targetsMissed: number;
  totalClicks: number;
  accuracy: number;            // 0 - 100%
  kps: number;                 // Alvos por segundo
  avgReactionMs: number;       // Média de reação (ms)
  bestReactionMs: number;      // Melhor tempo (ms)
  trackingTimePercent?: number;// Apenas para tracking
  headshotPercent?: number;    // Para alvos com cabeça
  reactionTimesHistory: number[];
  rankGrade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'pending' | 'blocked';

export interface User {
  id: string;
  username: string;
  displayName: string;
  password?: string;          // Deprecated, use passwordHash
  passwordHash?: string;      // Salted SHA-256 hash
  role: UserRole;
  status: UserStatus;         // 'active' (aprovado) | 'pending' (aguardando admin) | 'blocked'
  isMasterAdmin: boolean;     // Admin principal não pode ser excluído nem rebaixado
  avatar: string;             // Ícone ou cor
  bio?: string;
  contactInfo?: string;       // WhatsApp / Discord / Contato para liberação
  csSensitivity?: number;
  mouseDpi?: number;
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string;
}

export interface UserActivitySummary {
  userId: string;
  totalTrainingTimeSeconds: number;
  totalRounds: number;
  exerciseCounts: Record<ExerciseId, number>;
  mostPlayedExercise: ExerciseId | null;
  overallAccuracy: number;
  avgReactionMs: number;
  bestReactionMs: number;
  totalTargetsHit: number;
  highscores: Record<ExerciseId, number>;
  trophiesWon: ExerciseId[];   // Exercícios onde o usuário detém o recorde #1 absoluto
}

export interface PlaylistItem {
  id: string;
  exerciseId: ExerciseId;
  durationSeconds: DurationOption;
}

export interface PlaylistRoutine {
  id: string;
  name: string;
  description: string;
  isPreset: boolean;
  icon: string;
  items: PlaylistItem[];
}

export interface PlaylistSessionProgress {
  playlist: PlaylistRoutine;
  currentIndex: number;
  stepResults: RoundStats[];
  isCompleted: boolean;
}
