import { User, RoundStats, ExerciseId, UserActivitySummary, UserStatus, UserRole } from '../types/aim';
import { hashPassword, verifyPassword, sanitizeText } from './security';

const USERS_KEY = 'cs2_aim_users_v3';
const LEGACY_USERS_KEY = 'cs2_aim_users_v2';
const CURRENT_USER_KEY = 'cs2_aim_session_v3';
const LEGACY_CURRENT_USER_KEY = 'cs2_aim_session_v2';
const GLOBAL_ROUNDS_KEY = 'cs2_aim_global_rounds_v3';
const LEGACY_GLOBAL_ROUNDS_KEY = 'cs2_aim_global_rounds_v2';

// System Root Master Admin - The only default seeded user
export const ROOT_MASTER_ADMIN: User = {
  id: 'user_master_admin',
  username: 'admin',
  displayName: 'Admin Principal',
  passwordHash: hashPassword('admin123'),
  role: 'admin',
  status: 'active',
  isMasterAdmin: true,
  avatar: '👑',
  bio: 'Administrador geral do sistema de treino CS2.',
  csSensitivity: 1.2,
  mouseDpi: 800,
  createdAt: 1740000000000,
};

// Seed records are strictly empty as requested: "os recordes ainda não existem então remove eles"
const EMPTY_ROUNDS: RoundStats[] = [];

// List of legacy demo usernames to purge completely
const PURGE_USERNAMES = new Set(['s1mple', 'fallen', 'coldzera', 'player1', 'novato']);
const PURGE_ROUND_IDS = new Set([
  'round_s1mple_grid',
  'round_s1mple_reflex',
  'round_fallen_micro',
  'round_fallen_strafe',
  'round_cold_tracking',
  'round_cold_switch',
]);

/**
 * Loads all users, migrating and purging old demo users and plaintext passwords
 */
export function getUsers(): User[] {
  try {
    let raw = localStorage.getItem(USERS_KEY);
    
    // Check legacy key if new key not yet populated
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_USERS_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        // Purge legacy key to prevent leaks
        localStorage.removeItem(LEGACY_USERS_KEY);
      }
    }

    if (raw) {
      let parsed: User[] = JSON.parse(raw);

      // 1. Purge unwanted demo users (s1mple, fallen, coldzera, player1)
      parsed = parsed.filter(u => !PURGE_USERNAMES.has(u.username.toLowerCase()));

      // 2. Ensure Master Admin exists
      const masterIdx = parsed.findIndex(u => u.isMasterAdmin || u.username.toLowerCase() === 'admin');
      if (masterIdx === -1) {
        parsed.unshift({ ...ROOT_MASTER_ADMIN });
      } else {
        // Enforce master admin protection & integrity
        parsed[masterIdx] = {
          ...parsed[masterIdx],
          isMasterAdmin: true,
          role: 'admin',
          status: 'active',
          passwordHash: parsed[masterIdx].passwordHash || hashPassword(parsed[masterIdx].password || 'admin123'),
        };
        delete parsed[masterIdx].password;
      }

      // 3. Ensure all other accounts have hashed passwords and valid status
      parsed = parsed.map(u => {
        const updated = { ...u };
        if (!updated.passwordHash) {
          updated.passwordHash = hashPassword(updated.password || 'cs2pro');
        }
        delete updated.password; // Do not store plaintext in memory or storage
        if (!updated.status) {
          updated.status = updated.isMasterAdmin ? 'active' : 'pending';
        }
        return updated;
      });

      // Save sanitized list
      localStorage.setItem(USERS_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }

  // Initial fresh state with only master admin
  const initial = [{ ...ROOT_MASTER_ADMIN }];
  localStorage.setItem(USERS_KEY, JSON.stringify(initial));
  return initial;
}

export function saveUsers(users: User[]) {
  try {
    // Sanitize: ensure no passwords are stored plain
    const sanitized = users.map(u => {
      const copy = { ...u };
      if (!copy.passwordHash && copy.password) {
        copy.passwordHash = hashPassword(copy.password);
      }
      delete copy.password;
      return copy;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

/**
 * Returns a sanitized copy of a User (without password or passwordHash) for safe UI consumption
 */
export function sanitizeUserForClient(user: User): User {
  const safe = { ...user };
  delete safe.password;
  delete safe.passwordHash;
  return safe;
}

export function getCurrentUser(): User | null {
  try {
    let raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_CURRENT_USER_KEY);
      if (raw) localStorage.removeItem(LEGACY_CURRENT_USER_KEY);
    }

    if (raw) {
      const user: User = JSON.parse(raw);
      // Check if user was one of the purged demo users
      if (PURGE_USERNAMES.has(user.username.toLowerCase())) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }

      const users = getUsers();
      const fresh = users.find(u => u.id === user.id);
      if (!fresh) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }

      // If user was blocked or pending, invalidate session
      if (fresh.status !== 'active') {
        localStorage.removeItem(CURRENT_USER_KEY);
        return null;
      }

      return sanitizeUserForClient(fresh);
    }
  } catch (e) {
    console.error('Error loading current user:', e);
  }
  return null;
}

export function setCurrentUser(user: User | null) {
  try {
    if (user) {
      const safe = sanitizeUserForClient(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safe));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(LEGACY_CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting current user:', e);
  }
}

/**
 * Authenticates user credentials with security hashing & approval validation
 */
export function authenticateUser(
  usernameInput: string,
  passInput: string
): { success: boolean; user?: User; error?: string; isPending?: boolean } {
  const cleanUsername = sanitizeText(usernameInput.trim().toLowerCase(), 40);
  if (!cleanUsername) {
    return { success: false, error: 'Por favor, informe seu nome de usuário.' };
  }
  if (!passInput) {
    return { success: false, error: 'Por favor, informe sua senha.' };
  }

  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === cleanUsername);

  if (!user) {
    return { success: false, error: 'Usuário não encontrado. Verifique seu login ou faça o cadastro.' };
  }

  // Verify secure hash
  const isValidPass = verifyPassword(passInput, user.passwordHash || user.password || '');
  if (!isValidPass) {
    return { success: false, error: 'Senha incorreta. Tente novamente.' };
  }

  // Check approval status: Pending users must wait for admin approval!
  if (user.status === 'pending') {
    return {
      success: false,
      isPending: true,
      error: `Sua conta (@${user.username}) está AGUARDANDO APROVAÇÃO do Administrador. Entre em contato com o admin para ter seu acesso liberado.`,
    };
  }

  if (user.status === 'blocked') {
    return {
      success: false,
      error: 'Esta conta está suspensa ou bloqueada pelo Administrador.',
    };
  }

  const safeUser = sanitizeUserForClient(user);
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

/**
 * Registers a new account.
 * By default, accounts created by visitors have status = 'pending' and REQUIRE admin approval!
 */
export function createUser(userData: {
  username: string;
  displayName: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
  contactInfo?: string;
  bio?: string;
}): { success: boolean; user?: User; error?: string } {
  const cleanUsername = sanitizeText(userData.username.toLowerCase(), 30).replace(/[^a-z0-9_.-]/g, '');

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'O nome de usuário deve ter pelo menos 3 caracteres alfanuméricos.' };
  }

  if (PURGE_USERNAMES.has(cleanUsername)) {
    return { success: false, error: 'Este nome de usuário está reservado pelo sistema.' };
  }

  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
    return { success: false, error: 'Este nome de usuário já está em uso por outro jogador.' };
  }

  if (!userData.password || userData.password.length < 4) {
    return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' };
  }

  const cleanDisplayName = sanitizeText(userData.displayName || cleanUsername, 35);
  const cleanContact = sanitizeText(userData.contactInfo || '', 60);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    displayName: cleanDisplayName,
    passwordHash: hashPassword(userData.password),
    role: userData.role || 'user',
    // If not specified, visitor accounts are ALWAYS 'pending'
    status: userData.status || 'pending',
    isMasterAdmin: false,
    avatar: userData.avatar || '🎯',
    contactInfo: cleanContact,
    bio: sanitizeText(userData.bio || '', 120),
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, user: sanitizeUserForClient(newUser) };
}

/**
 * Approves a pending user account
 */
export function approveUser(userId: string, approvedByAdmin: string): { success: boolean; error?: string } {
  const users = getUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  target.status = 'active';
  target.approvedAt = Date.now();
  target.approvedBy = approvedByAdmin;

  saveUsers(users);
  return { success: true };
}

/**
 * Sets user status (active | pending | blocked)
 */
export function setUserStatus(userId: string, status: UserStatus): { success: boolean; error?: string } {
  const users = getUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  if (target.isMasterAdmin) {
    return { success: false, error: 'O Administrador Principal não pode ser bloqueado.' };
  }

  target.status = status;
  saveUsers(users);
  return { success: true };
}

/**
 * Resets user password by admin
 */
export function resetUserPassword(userId: string, newPlainPass: string): { success: boolean; error?: string } {
  if (!newPlainPass || newPlainPass.length < 4) {
    return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };
  }

  const users = getUsers();
  const target = users.find(u => u.id === userId);
  if (!target) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  target.passwordHash = hashPassword(newPlainPass);
  delete target.password;
  saveUsers(users);
  return { success: true };
}

/**
 * Updates general user profile info
 */
export function updateUser(userId: string, updates: Partial<User> & { newPassword?: string }): { success: boolean; error?: string } {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  const existing = users[index];

  // Prevent demoting root master admin
  if (existing.isMasterAdmin) {
    updates.isMasterAdmin = true;
    updates.role = 'admin';
    updates.status = 'active';
  }

  if (updates.username && updates.username.toLowerCase() !== existing.username.toLowerCase()) {
    const clean = sanitizeText(updates.username.toLowerCase(), 30);
    if (users.some(u => u.id !== userId && u.username.toLowerCase() === clean)) {
      return { success: false, error: 'Nome de usuário já em uso.' };
    }
    updates.username = clean;
  }

  if (updates.newPassword && updates.newPassword.trim().length >= 4) {
    existing.passwordHash = hashPassword(updates.newPassword.trim());
    delete existing.password;
  }

  delete (updates as any).password;
  delete (updates as any).newPassword;

  users[index] = { ...existing, ...updates };
  saveUsers(users);

  // If current logged-in user changed, refresh session
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(sanitizeUserForClient(users[index]));
  }

  return { success: true };
}

/**
 * Deletes user permanently (Master Admin is protected and CANNOT be deleted)
 */
export function deleteUser(userId: string): { success: boolean; error?: string } {
  const users = getUsers();
  const target = users.find(u => u.id === userId);

  if (!target) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  if (target.isMasterAdmin) {
    return {
      success: false,
      error: 'Ação Bloqueada: O Administrador Principal é vital ao sistema e NÃO pode ser excluído por ninguém.',
    };
  }

  const updated = users.filter(u => u.id !== userId);
  saveUsers(updated);

  // Also remove their rounds from global records if needed
  try {
    const rounds = getGlobalRounds().filter(r => r.userId !== userId);
    localStorage.setItem(GLOBAL_ROUNDS_KEY, JSON.stringify(rounds));
  } catch (e) {
    console.error('Error cleaning rounds of deleted user:', e);
  }

  return { success: true };
}

// ----------------------------------------------------
// Global leaderboard / rounds storage (Fresh & Clean)
// ----------------------------------------------------

export function getGlobalRounds(): RoundStats[] {
  try {
    let raw = localStorage.getItem(GLOBAL_ROUNDS_KEY);
    if (!raw) {
      // Check legacy rounds key
      const legacyRaw = localStorage.getItem(LEGACY_GLOBAL_ROUNDS_KEY);
      if (legacyRaw) {
        localStorage.removeItem(LEGACY_GLOBAL_ROUNDS_KEY);
        raw = legacyRaw;
      }
    }

    if (raw) {
      const parsed: RoundStats[] = JSON.parse(raw);
      // Filter out any old fake seed rounds (s1mple, fallen, coldzera)
      const cleaned = parsed.filter(r => {
        if (!r.id) return false;
        if (PURGE_ROUND_IDS.has(r.id)) return false;
        if (r.username && PURGE_USERNAMES.has(r.username.toLowerCase())) return false;
        return true;
      });

      localStorage.setItem(GLOBAL_ROUNDS_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) {
    console.error('Error loading global rounds:', e);
  }

  // Clean empty state - records start from 0
  localStorage.setItem(GLOBAL_ROUNDS_KEY, JSON.stringify(EMPTY_ROUNDS));
  return EMPTY_ROUNDS;
}

export function recordGlobalRound(round: RoundStats) {
  try {
    const all = getGlobalRounds();
    // Validate round
    if (!round || typeof round.score !== 'number' || round.score <= 0) return;

    all.unshift(round);
    // Keep max 200 recent rounds
    localStorage.setItem(GLOBAL_ROUNDS_KEY, JSON.stringify(all.slice(0, 200)));
  } catch (e) {
    console.error('Error recording global round:', e);
  }
}

/**
 * Top #1 Trophy Holders per Exercise (Only real rounds with score > 0)
 */
export function getTrophyHolders(): Record<ExerciseId, { user: User | null; round: RoundStats | null }> {
  const rounds = getGlobalRounds();
  const users = getUsers();

  const exercises: ExerciseId[] = ['gridshot', 'reflex', 'tracking', 'microshot', 'target_switch', 'strafing'];
  const result: Partial<Record<ExerciseId, { user: User | null; round: RoundStats | null }>> = {};

  for (const exId of exercises) {
    const matching = rounds.filter(r => r.exerciseId === exId && r.score > 0);
    if (matching.length === 0) {
      result[exId] = { user: null, round: null };
      continue;
    }

    // Sort by highest score
    matching.sort((a, b) => b.score - a.score);
    const topRound = matching[0];
    const topUser = users.find(u => u.id === topRound.userId);

    const safeUser = topUser
      ? sanitizeUserForClient(topUser)
      : {
          id: topRound.userId || 'anon',
          username: topRound.username || 'Desconhecido',
          displayName: topRound.userDisplayName || 'Desconhecido',
          role: 'user' as UserRole,
          status: 'active' as UserStatus,
          isMasterAdmin: false,
          avatar: '🎯',
          createdAt: 0,
        };

    result[exId] = { user: safeUser, round: topRound };
  }

  return result as Record<ExerciseId, { user: User | null; round: RoundStats | null }>;
}

/**
 * User activity and stats analysis for profile inspection
 */
export function getUserActivitySummary(userId: string): UserActivitySummary {
  const allRounds = getGlobalRounds();
  const userRounds = allRounds.filter(r => r.userId === userId);
  const trophyHolders = getTrophyHolders();

  let totalTrainingTimeSeconds = 0;
  let totalTargetsHit = 0;
  let totalClicks = 0;
  const reactionTimes: number[] = [];
  let bestReactionMs = 9999;

  const exerciseCounts: Record<ExerciseId, number> = {
    gridshot: 0,
    reflex: 0,
    tracking: 0,
    microshot: 0,
    target_switch: 0,
    strafing: 0,
  };

  const highscores: Record<ExerciseId, number> = {
    gridshot: 0,
    reflex: 0,
    tracking: 0,
    microshot: 0,
    target_switch: 0,
    strafing: 0,
  };

  for (const r of userRounds) {
    totalTrainingTimeSeconds += (r.durationSeconds || 30);
    totalTargetsHit += (r.targetsHit || 0);
    totalClicks += (r.totalClicks || 0);

    if (r.exerciseId && exerciseCounts[r.exerciseId] !== undefined) {
      exerciseCounts[r.exerciseId]++;
      if (r.score > (highscores[r.exerciseId] || 0)) {
        highscores[r.exerciseId] = r.score;
      }
    }

    if (r.avgReactionMs > 0) {
      reactionTimes.push(r.avgReactionMs);
    }
    if (r.bestReactionMs > 0 && r.bestReactionMs < bestReactionMs) {
      bestReactionMs = r.bestReactionMs;
    }
  }

  // Find most played exercise
  let maxCount = -1;
  let mostPlayed: ExerciseId | null = null;
  (Object.keys(exerciseCounts) as ExerciseId[]).forEach((exId) => {
    if (exerciseCounts[exId] > maxCount && exerciseCounts[exId] > 0) {
      maxCount = exerciseCounts[exId];
      mostPlayed = exId;
    }
  });

  const overallAccuracy = totalClicks > 0 ? Math.round((totalTargetsHit / totalClicks) * 100) : 100;
  const avgReactionMs = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  // Determine which trophies this user holds (#1 across all users)
  const trophiesWon: ExerciseId[] = [];
  (Object.keys(trophyHolders) as ExerciseId[]).forEach((exId) => {
    const holder = trophyHolders[exId];
    if (holder?.user?.id === userId && (holder.round?.score || 0) > 0) {
      trophiesWon.push(exId);
    }
  });

  return {
    userId,
    totalTrainingTimeSeconds,
    totalRounds: userRounds.length,
    exerciseCounts,
    mostPlayedExercise: mostPlayed,
    overallAccuracy,
    avgReactionMs,
    bestReactionMs: bestReactionMs === 9999 ? 0 : bestReactionMs,
    totalTargetsHit,
    highscores,
    trophiesWon,
  };
}
