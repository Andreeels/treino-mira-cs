import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Lock, 
  User as UserIcon, 
  ShieldAlert, 
  Check, 
  AlertCircle,
  Crown,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
  MessageCircle,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types/aim';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  approveUser, 
  setUserStatus,
  resetUserPassword 
} from '../utils/userStorage';

interface AdminUsersModalProps {
  currentUser: User;
  onClose: () => void;
  onUsersUpdated: () => void;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  currentUser,
  onClose,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<User[]>(getUsers);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [resettingPassUserId, setResettingPassUserId] = useState<string | null>(null);
  const [newPassInput, setNewPassInput] = useState<string>('');
  
  // Custom non-blocking inline delete confirmation state (safe in iframe)
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // Tab filter: 'all' | 'pending' | 'active'
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');

  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Create form state
  const [newUsername, setNewUsername] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [newContactInfo, setNewContactInfo] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [newAvatar, setNewAvatar] = useState<string>('🎯');

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editContactInfo, setEditContactInfo] = useState<string>('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');

  const refreshList = () => {
    setUsers(getUsers());
    onUsersUpdated();
  };

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');

  const displayedUsers = users.filter(u => {
    if (statusFilter === 'pending') return u.status === 'pending';
    if (statusFilter === 'active') return u.status === 'active';
    return true;
  });

  const handleApprove = (userId: string, username: string) => {
    setError('');
    setSuccessMsg('');
    const res = approveUser(userId, currentUser.username);
    if (res.success) {
      setSuccessMsg(`Conta @${username} aprovada com sucesso! O jogador já pode fazer login.`);
      refreshList();
    } else {
      setError(res.error || 'Erro ao aprovar usuário.');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newUsername.trim() || !newPassword) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    const res = createUser({
      username: newUsername.trim(),
      displayName: newDisplayName.trim() || newUsername.trim(),
      contactInfo: newContactInfo.trim(),
      password: newPassword,
      role: newRole,
      status: newStatus,
      avatar: newAvatar || '🎯',
    });

    if (res.success) {
      setSuccessMsg(`Usuário @${newUsername.toLowerCase()} cadastrado com sucesso!`);
      setNewUsername('');
      setNewDisplayName('');
      setNewContactInfo('');
      setNewPassword('');
      setNewRole('user');
      setNewStatus('active');
      setIsCreating(false);
      refreshList();
    } else {
      setError(res.error || 'Erro ao criar usuário.');
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditDisplayName(user.displayName);
    setEditContactInfo(user.contactInfo || '');
    setEditRole(user.role);
    setEditStatus(user.status || 'active');
    setResettingPassUserId(null);
    setConfirmDeleteUserId(null);
    setError('');
    setSuccessMsg('');
  };

  const handleSaveEdit = (userId: string) => {
    setError('');
    setSuccessMsg('');

    const res = updateUser(userId, {
      displayName: editDisplayName.trim(),
      contactInfo: editContactInfo.trim(),
      role: editRole,
      status: editStatus,
    });

    if (res.success) {
      setSuccessMsg('Dados do usuário atualizados com sucesso!');
      setEditingUserId(null);
      refreshList();
    } else {
      setError(res.error || 'Erro ao atualizar.');
    }
  };

  const handleResetPasswordSubmit = (userId: string) => {
    setError('');
    setSuccessMsg('');

    if (!newPassInput || newPassInput.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    const res = resetUserPassword(userId, newPassInput);
    if (res.success) {
      setSuccessMsg('Senha redefinida com sucesso!');
      setResettingPassUserId(null);
      setNewPassInput('');
      refreshList();
    } else {
      setError(res.error || 'Erro ao redefinir senha.');
    }
  };

  const executeDelete = (user: User) => {
    setError('');
    setSuccessMsg('');

    if (user.isMasterAdmin) {
      setError('Ação Bloqueada: O Administrador Principal não pode ser excluído por ninguém.');
      setConfirmDeleteUserId(null);
      return;
    }

    const res = deleteUser(user.id);
    if (res.success) {
      setSuccessMsg(`Usuário @${user.username} foi excluído com sucesso do sistema.`);
      setConfirmDeleteUserId(null);
      refreshList();
    } else {
      setError(res.error || 'Erro ao apagar usuário.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">
                  Controle de Usuários &amp; Aprovações
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-bold">
                  Painel Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Aprove solicitações de novos jogadores, gerencie acessos e redefina credenciais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { 
                setIsCreating(prev => !prev); 
                setEditingUserId(null);
                setResettingPassUserId(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isCreating ? 'Fechar Formulário' : 'Novo Usuário'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Pending Approvals Top Notification Banner */}
        {pendingUsers.length > 0 && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Solicitações Pendentes para Aprovação ({pendingUsers.length})</span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono">
                Necessitam de sua autorização para entrar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {pendingUsers.map(pUser => (
                <div 
                  key={pUser.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{pUser.avatar || '🎯'}</span>
                      <span className="font-bold text-xs text-white truncate">{pUser.displayName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 block truncate">
                      @{pUser.username}
                    </span>
                    {pUser.contactInfo && (
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                        <MessageCircle className="w-3 h-3 shrink-0" />
                        {pUser.contactInfo}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(pUser.id, pUser.username)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      title="Aprovar Acesso Imediatamente"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>

                    <button
                      onClick={() => setConfirmDeleteUserId(pUser.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                      title="Recusar e Apagar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create User Box */}
        {isCreating && (
          <div className="p-5 mx-6 mt-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário / Administrador</span>
            </h4>

            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Username (Login)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value.toLowerCase())}
                  placeholder="Ex: player_cs"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  placeholder="Ex: Gabriel"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Contato (WhatsApp/Discord)</label>
                <input
                  type="text"
                  value={newContactInfo}
                  onChange={e => setNewContactInfo(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Senha Inicial</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Cargo / Permissão</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="user">Jogador Padrão</option>
                  <option value="admin">Administrador (Permissões de Admin)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Status Inicial</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="active">✓ Ativo (Liberado)</option>
                  <option value="pending">⏳ Pendente (Aguardando)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Ícone / Avatar</label>
                <select
                  value={newAvatar}
                  onChange={e => setNewAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="🎯">🎯 Alvo</option>
                  <option value="⚡">⚡ Raio</option>
                  <option value="🔥">🔥 Fogo</option>
                  <option value="👑">👑 Coroa</option>
                  <option value="🎮">🎮 Controle</option>
                  <option value="💀">💀 Caveira</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Salvar e Criar Conta
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="px-6 pt-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'active' ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ativos ({activeUsers.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pendentes ({pendingUsers.length})
            </button>
          </div>

          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Proteção Criptográfica Ativa (Senhas Hashed)
          </span>
        </div>

        {/* Users List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {displayedUsers.length === 0 ? (
            <div className="p-10 rounded-2xl bg-zinc-950 border border-zinc-800 text-center text-zinc-500 text-xs">
              Nenhum usuário encontrado nesta categoria.
            </div>
          ) : (
            displayedUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const isResettingPass = resettingPassUserId === user.id;
              const isConfirmingDelete = confirmDeleteUserId === user.id;

              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    user.isMasterAdmin
                      ? 'bg-zinc-950/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : user.status === 'pending'
                      ? 'bg-zinc-950/70 border-amber-500/30'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Inline Delete Confirmation Banner (Reliable, no window.confirm) */}
                  {isConfirmingDelete ? (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Confirmar exclusão permanente da conta @{user.username}?</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Esta ação apagará o cadastro e todos os dados associados a este usuário. Essa ação não pode ser desfeita.
                      </p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteUserId(null)}
                          className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => executeDelete(user)}
                          className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Sim, Excluir Usuário</span>
                        </button>
                      </div>
                    </div>
                  ) : isResettingPass ? (
                    /* Inline Password Reset Box */
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Redefinir Senha de @{user.username}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setResettingPassUserId(null)}
                          className="text-zinc-500 hover:text-white text-xs"
                        >
                          Fechar
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={newPassInput}
                          onChange={e => setNewPassInput(e.target.value)}
                          placeholder="Digite a nova senha..."
                          className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleResetPasswordSubmit(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer"
                        >
                          Salvar Nova Senha
                        </button>
                      </div>
                    </div>
                  ) : isEditing ? (
                    /* Inline Editing Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          Editando @{user.username}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 block">Nome de Exibição</label>
                          <input
                            type="text"
                            value={editDisplayName}
                            onChange={e => setEditDisplayName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 block">Contato</label>
                          <input
                            type="text"
                            value={editContactInfo}
                            onChange={e => setEditContactInfo(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 block">Cargo</label>
                          <select
                            value={editRole}
                            disabled={user.isMasterAdmin}
                            onChange={e => setEditRole(e.target.value as UserRole)}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white disabled:opacity-50"
                          >
                            <option value="user">Jogador</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 block">Status de Acesso</label>
                          <select
                            value={editStatus}
                            disabled={user.isMasterAdmin}
                            onChange={e => setEditStatus(e.target.value as UserStatus)}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white disabled:opacity-50"
                          >
                            <option value="active">Ativo (Liberado)</option>
                            <option value="pending">Pendente (Em Análise)</option>
                            <option value="blocked">Bloqueado</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(user.id)}
                          className="px-4 py-1 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shrink-0">
                          {user.avatar || '🎯'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-white">
                              {user.displayName}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">
                              @{user.username}
                            </span>

                            {/* Status Tag */}
                            {user.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/40">
                                <Clock className="w-3 h-3 text-amber-400" />
                                Pendente
                              </span>
                            ) : user.status === 'blocked' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/40">
                                Bloqueado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                Ativo
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {user.isMasterAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/40">
                                <Crown className="w-3 h-3 text-amber-400" />
                                Admin Principal (Vitalício)
                              </span>
                            ) : user.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/40">
                                <ShieldCheck className="w-3 h-3" />
                                Administrador
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                                Jogador
                              </span>
                            )}

                            {user.contactInfo && (
                              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                                <MessageCircle className="w-3 h-3 text-zinc-500" />
                                {user.contactInfo}
                              </span>
                            )}

                            {/* Protected Password Bullet Display (No plaintext exposure) */}
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-zinc-600" />
                              Senha: <span className="tracking-widest text-zinc-500 font-mono">••••••••</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {/* Quick Approve button if pending */}
                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(user.id, user.username)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                            title="Aprovar Acesso"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprovar</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setResettingPassUserId(user.id);
                            setNewPassInput('');
                            setEditingUserId(null);
                            setConfirmDeleteUserId(null);
                          }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors cursor-pointer"
                          title="Redefinir Senha do Usuário"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-500/80" />
                          <span className="hidden sm:inline">Nova Senha</span>
                        </button>

                        <button
                          onClick={() => startEdit(user)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-colors cursor-pointer"
                          title="Editar Usuário"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* Delete Button with Master Admin Protection and Safe Inline Confirmation */}
                        {user.isMasterAdmin ? (
                          <div
                            title="O Administrador Principal é vital ao sistema e NÃO pode ser excluído por ninguém."
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-600 text-xs cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                            <span>Inexcluível</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmDeleteUserId(user.id);
                              setEditingUserId(null);
                              setResettingPassUserId(null);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                            title="Apagar Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Apagar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Regra de Segurança: O Administrador Principal está protegido e senhas são criptografadas.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
