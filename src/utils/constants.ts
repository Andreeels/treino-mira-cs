import { ExerciseInfo, ExerciseId, TargetThemeId } from '../types/aim';

export const EXERCISES: Record<ExerciseId, ExerciseInfo> = {
  gridshot: {
    id: 'gridshot',
    title: 'Gridshot Clássico',
    subtitle: 'Flicking & Destruição Contínua de Círculos',
    description: '3 círculos sempre ativos na tela. Destrua um círculo com um clique e outro reaparecerá imediatamente em outra posição.',
    category: 'Flicking',
    badge: 'Popular CS2',
    iconName: 'LayoutGrid',
    accentColor: '#f59e0b', // Amarelo CS2
    mechanicsDescription: 'Treina memória muscular, velocidade de flicking e precisão em disparos sequenciais rápidos.',
  },
  reflex: {
    id: 'reflex',
    title: 'Reflexo & Tempo de Reação',
    subtitle: 'Reação Rápida em Milissegundos',
    description: 'Um alvo surge de surpresa em locais aleatórios após um intervalo inesperado. Clique antes que ele desapareça.',
    category: 'Reflexo',
    badge: 'Reaction ms',
    iconName: 'Zap',
    accentColor: '#ef4444', // Vermelho alerta
    mechanicsDescription: 'Mede e aprimora seu tempo de reação (ms) ao abrir ou segurar pixels e ângulos no CS2.',
  },
  tracking: {
    id: 'tracking',
    title: 'Acompanhamento Contínuo (Tracking)',
    subtitle: 'Smooth Tracking & Controle Contínuo',
    description: 'Um alvo desliza em trajetórias imprevisíveis pela tela. Mantenha sua mira sobre o círculo o tempo todo sem perder o contato.',
    category: 'Tracking',
    badge: 'Smoothness',
    iconName: 'Activity',
    accentColor: '#06b6d4', // Ciano
    mechanicsDescription: 'Fundamental para rastrear inimigos correndo com SMG/Pistola ou pulando esquinas no CS2.',
  },
  microshot: {
    id: 'microshot',
    title: 'Micro-Shot (Headshot Precision)',
    subtitle: 'Micro-Ajustes Milimétricos',
    description: 'Alvos diminutos que simulam cabeças à distância. Exige precisão cirúrgica sem tolerância para disparos errados.',
    category: 'Precisão',
    badge: 'One-Tap Headshot',
    iconName: 'Crosshair',
    accentColor: '#10b981', // Verde esmeralda
    mechanicsDescription: 'Perfeito para acertar o primeiro tiro na cabeça (First Bullet Accuracy) de AK-47 e M4A1.',
  },
  target_switch: {
    id: 'target_switch',
    title: 'Target Switching & Spray Transfer',
    subtitle: 'Troca Rápida de Alvos Resistentes',
    description: 'Alvos com barra de durabilidade. Mantenha o clique ou rajada rápida sobre um alvo até explodir e transfira a mira instantaneamente para o próximo.',
    category: 'Dinâmico',
    badge: 'Spray Transfer',
    iconName: 'Repeat',
    accentColor: '#a855f7', // Roxo neon
    mechanicsDescription: 'Treina a troca de alvos no meio de um tiroteio (Spray Transfer e controle de recuo mental).',
  },
  strafing: {
    id: 'strafing',
    title: 'CS2 Strafe & Jiggle Peek',
    subtitle: 'Alvos com Movimentação A-D de CS2',
    description: 'Bonecos que executam movimentação de counter-strafe horizontal, parando e mudando de direção. Acertos na cabeça causam headshot com som metálico.',
    category: 'Dinâmico',
    badge: 'Simulação CS2',
    iconName: 'MoveHorizontal',
    accentColor: '#3b82f6', // Azul tático
    mechanicsDescription: 'Simula o comportamento real de jogadores no CS2 fazendo strafe em esquinas (Mirage, Inferno, Dust2).',
  },
};

export const TARGET_THEMES: Record<TargetThemeId, { name: string; primary: string; secondary: string; glow: string; border: string }> = {
  cs2_gold: {
    name: 'CS2 Ouro & Laranja',
    primary: '#f59e0b',
    secondary: '#d97706',
    glow: 'rgba(245, 158, 11, 0.45)',
    border: '#fbbf24',
  },
  neon_cyan: {
    name: 'Ciano Neon Aim Lab',
    primary: '#06b6d4',
    secondary: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.5)',
    border: '#22d3ee',
  },
  acid_green: {
    name: 'Verde Ácido Tático',
    primary: '#10b981',
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.5)',
    border: '#34d399',
  },
  hot_pink: {
    name: 'Rosa Choque Cyberpunk',
    primary: '#ec4899',
    secondary: '#db2777',
    glow: 'rgba(236, 72, 153, 0.5)',
    border: '#f472b6',
  },
  crimson: {
    name: 'Carmesim Sangue',
    primary: '#ef4444',
    secondary: '#b91c1c',
    glow: 'rgba(239, 68, 68, 0.5)',
    border: '#f87171',
  },
};
