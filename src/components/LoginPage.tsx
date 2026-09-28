import React, { useState } from 'react';
import { 
  Target, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  ShieldAlert,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { authenticateUser, createUser } from '../utils/userStorage';
import { User } from '../types/aim';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [error, setError] = useState<string>('');
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    username: string;
    displayName: string;
  } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingNotice(null);

    if (!username.trim() || !password) {
      setError('Por favor preencha seu nome de usuário e senha.');
      return;
    }

    const res = authenticateUser(username, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      if (res.isPending) {
        setPendingNotice(res.error || 'Sua conta está aguardando aprovação do Administrador.');
      } else {
        setError(res.error || 'Credenciais inválidas.');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingNotice(null);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }

    if (cleanUser.length < 3) {
      setError('O nome de usuário deve conter no mínimo 3 caracteres.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    // Register user with status = 'pending' (requires admin manual approval)
    const res = createUser({
      username: cleanUser,
      displayName: displayName.trim() || cleanUser,
      contactInfo: contactInfo.trim(),
      password,
      status: 'pending',
      role: 'user',
      avatar: '🎯',
    });

    if (res.success && res.user) {
      // Clear form
      setPassword('');
      setConfirmPassword('');
      // Show explicit registration approval screen
      setRegistrationSuccessData({
        username: res.user.username,
        displayName: res.user.displayName,
      });
    } else {
      setError(res.error || 'Erro ao solicitar cadastro de conta.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-xl shadow-amber-500/25 border border-amber-400 mx-auto">
            <Target className="w-8 h-8 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-white tracking-wider">
              CS2 <span className="text-amber-500">AIM LAB</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Portal Seguro • Acesso Controlado
            </p>
          </div>
        </div>

        {/* If user just registered, show Pending Approval Screen */}
        {registrationSuccessData ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display font-black text-lg text-white">
                Cadastro Enviado com Sucesso!
              </h2>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
                Status: Aguardando Aprovação do Admin
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left space-y-2.5 text-xs">
              <p className="text-zinc-300">
                Sua conta <strong className="text-amber-400">@{registrationSuccessData.username}</strong> foi cadastrada no sistema.
              </p>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300/90 text-xs space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  Próximo Passo Obrigatório:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Entre em contato diretamente com o <strong>Administrador</strong> informando seu nome de usuário (<strong>@{registrationSuccessData.username}</strong>) para que ele ative sua conta no painel de controle.
                </p>
              </div>
              <p className="text-[11px] text-zinc-500">
                Assim que sua conta for aprovada pelo admin, você poderá fazer login normalmente com sua senha.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setRegistrationSuccessData(null);
                setIsRegisterMode(false);
                setError('');
                setPendingNotice(null);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Ir para a Tela de Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Tab switch: Login or Create account */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { 
                  setIsRegisterMode(false); 
                  setError(''); 
                  setPendingNotice(null); 
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  !isRegisterMode ? 'bg-amber-500 text-zinc-950 shadow-md font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Entrar com Conta
              </button>
              <button
                type="button"
                onClick={() => { 
                  setIsRegisterMode(true); 
                  setError(''); 
                  setPendingNotice(null); 
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  isRegisterMode ? 'bg-amber-500 text-zinc-950 shadow-md font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Criar Nova Conta
              </button>
            </div>

            {/* Pending Notice Alert */}
            {pendingNotice && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 block mb-0.5">
                      Acesso Pendente de Aprovação
                    </span>
                    <p className="text-zinc-300 leading-relaxed">
                      {pendingNotice}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-400/90 font-mono">
                  💡 Fale com o Administrador para liberar seu acesso.
                </div>
              </div>
            )}

            {/* Error alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Notice when registering */}
            {isRegisterMode && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso:</strong> Novas contas precisam de aprovação manual do Administrador antes do primeiro acesso para evitar acessos não autorizados.
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Usuário (Username)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase())}
                    placeholder="Ex: seu_usuario"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
                    required
                  />
                </div>
              </div>

              {isRegisterMode && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Nome / Apelido no Treino
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Ex: Seu Nome de Jogador"
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Contato para Ativação (WhatsApp ou Discord)
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={contactInfo}
                        onChange={e => setContactInfo(e.target.value)}
                        placeholder="Ex: (11) 99999-9999 ou Discord#0000"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                      Facilita para o Admin identificar e liberar seu cadastro.
                    </span>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
                    required
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <span>{isRegisterMode ? 'Cadastrar e Solicitar Aprovação' : 'Acessar Treinador'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Security Info */}
            <div className="pt-3 border-t border-zinc-800/80 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Sistema de Acesso Restrito &amp; Proteção de Credenciais</span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
