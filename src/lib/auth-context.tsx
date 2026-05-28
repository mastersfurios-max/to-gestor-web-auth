import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Database } from './database.types';

type UsuarioRow = Database['public']['Tables']['usuarios']['Row'];
type ClinicaRow = Database['public']['Tables']['clinicas']['Row'];

export type PerfilUsuario = 'admin' | 'terapeuta' | 'secretaria';

export interface UsuarioLogado extends UsuarioRow {
  clinica?: ClinicaRow | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  usuario: UsuarioLogado | null;
  loading: boolean;
  perfil: PerfilUsuario | null;
  isAdmin: boolean;
  isTerapeuta: boolean;
  isSecretaria: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsuario = async (userId: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, clinica:clinicas(*)')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar usuário:', error);
      setUsuario(null);
      return;
    }
    setUsuario(data as UsuarioLogado);
  };

  useEffect(() => {
    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuario(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuario(session.user.id);
      } else {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'E-mail ou senha incorretos.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Confirme seu e-mail antes de entrar.' };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  const refreshUsuario = async () => {
    if (user) await fetchUsuario(user.id);
  };

  const perfil = (usuario?.perfil ?? null) as PerfilUsuario | null;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      usuario,
      loading,
      perfil,
      isAdmin: perfil === 'admin',
      isTerapeuta: perfil === 'terapeuta',
      isSecretaria: perfil === 'secretaria',
      signIn,
      signOut,
      refreshUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
