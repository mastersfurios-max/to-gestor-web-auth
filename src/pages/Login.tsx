import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Activity } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    const { error } = await signIn(email.trim().toLowerCase(), senha);
    setCarregando(false);
    if (error) setErro(error);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-700 to-teal-500 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 mx-auto">
            <Activity size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">TO Gestor</h1>
          <p className="text-teal-100 text-lg mb-8">
            Sistema de Gestão para Terapia Ocupacional
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            {[
              { icon: '📋', label: 'Prontuários clínicos completos' },
              { icon: '📅', label: 'Agenda e agendamentos integrados' },
              { icon: '💰', label: 'Gestão financeira simplificada' },
              { icon: '👥', label: 'Multi-profissionais e perfis de acesso' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-xl">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TO Gestor</h1>
              <p className="text-xs text-gray-500">Terapia Ocupacional</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
              <p className="text-gray-500 mt-1 text-sm">Entre com suas credenciais para acessar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail profissional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  disabled={carregando}
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    disabled={carregando}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-red-500">⚠</span>
                  {erro}
                </div>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Problemas para acessar? Entre em contato com o administrador da clínica.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            TO Gestor © {new Date().getFullYear()} — Sistema de Gestão em Terapia Ocupacional
          </p>
        </div>
      </div>
    </div>
  );
}
