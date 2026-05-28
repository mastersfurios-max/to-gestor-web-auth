import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type PerfilUsuario } from '../lib/auth-context';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  /** Perfis com permissão. Se vazio, qualquer autenticado pode acessar. */
  perfisPermitidos?: PerfilUsuario[];
}

export default function ProtectedRoute({ perfisPermitidos = [] }: ProtectedRouteProps) {
  const { user, usuario, loading, perfil } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-teal-600 animate-spin" />
          <p className="text-gray-500 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autenticado → Login
  if (!user) return <Navigate to="/login" replace />;

  // Aguarda carregar perfil
  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-teal-600 animate-spin" />
          <p className="text-gray-500 text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Usuário inativo
  if (!usuario.ativo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Suspenso</h2>
          <p className="text-gray-500 text-sm">
            Sua conta foi desativada. Entre em contato com o administrador da clínica.
          </p>
        </div>
      </div>
    );
  }

  // Sem clínica associada (exceto admin global)
  if (!usuario.clinica_id && perfil !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <ShieldAlert size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sem Clínica Associada</h2>
          <p className="text-gray-500 text-sm">
            Sua conta ainda não foi vinculada a uma clínica. Aguarde o administrador configurar seu acesso.
          </p>
        </div>
      </div>
    );
  }

  // Verifica perfil se necessário
  if (perfisPermitidos.length > 0 && perfil && !perfisPermitidos.includes(perfil)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <ShieldAlert size={48} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-500 text-sm">
            Você não tem permissão para acessar esta área.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-teal-600 text-sm font-medium hover:underline"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
