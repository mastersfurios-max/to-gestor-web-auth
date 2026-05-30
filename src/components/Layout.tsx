import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileText, DollarSign,
  Lightbulb, Settings, Menu, X, ChevronRight, Bell, Sun, Moon,
  LogOut, ShieldCheck, UserCog
} from 'lucide-react';
import { useApp } from '../context';
import { useAuth } from '../lib/auth-context';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true, perfis: ['admin', 'terapeuta', 'secretaria'] },
  { to: '/pacientes', icon: Users, label: 'Pacientes', perfis: ['admin', 'terapeuta', 'secretaria'] },
  { to: '/agenda', icon: Calendar, label: 'Agenda', perfis: ['admin', 'terapeuta', 'secretaria'] },
  { to: '/clinico', icon: FileText, label: 'Clínico', perfis: ['admin', 'terapeuta'] },
 { to: '/financeiro', icon: DollarSign, label: 'Financeiro', perfis: ['admin', 'secretaria'] },,
  { to: '/sugestoes', icon: Lightbulb, label: 'Sugestões', perfis: ['admin', 'terapeuta'] },
  { to: '/admin', icon: ShieldCheck, label: 'Administração', perfis: ['admin'] },
  { to: '/configuracoes', icon: Settings, label: 'Configurações', perfis: ['admin', 'terapeuta', 'secretaria'] },
];

const PERFIL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  terapeuta: 'Terapeuta',
  secretaria: 'Secretária',
};

const PERFIL_COLORS: Record<string, string> = {
  admin: '#7c3aed',
  terapeuta: '#0d9488',
  secretaria: '#d97706',
};

export default function Layout() {
  const { state, dispatch } = useApp();
  const { usuario, perfil, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const toggleTema = () => dispatch({ type: 'SET_TEMA', payload: state.tema === 'light' ? 'dark' : 'light' });
  const pendencias = state.cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido').length;

  const navItems = NAV_ITEMS.filter(item =>
    !perfil || item.perfis.includes(perfil)
  );

  const nomeExibicao = usuario?.nome ?? 'Usuário';
  const inicialNome = nomeExibicao.charAt(0).toUpperCase();
  const perfilLabel = perfil ? PERFIL_LABELS[perfil] : '';
  const perfilCor = perfil ? PERFIL_COLORS[perfil] : '#0d9488';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        minWidth: 240,
        backgroundColor: 'var(--color-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'transform 0.2s ease',
        ...(window.innerWidth < 768 ? {
          position: 'fixed' as const,
          top: 0, left: 0, bottom: 0,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        } : {}),
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>TO</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>TO Gestor</div>
              <div style={{ color: 'var(--color-sidebar-text)', fontSize: 11 }}>Terapia Ocupacional</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'var(--color-sidebar-text)',
                backgroundColor: isActive ? 'var(--color-sidebar-active)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && <ChevronRight size={14} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Usuário logado */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 4px', borderRadius: 8,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              background: perfilCor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {inicialNome}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nomeExibicao}
              </div>
              <div style={{ color: perfilCor, fontSize: 11, fontWeight: 500 }}>{perfilLabel}</div>
            </div>
            <UserCog size={14} style={{ color: 'var(--color-sidebar-text)', flexShrink: 0 }} />
          </button>

          {/* Menu do usuário */}
          {showUserMenu && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 12, right: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 10, padding: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 100,
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>{nomeExibicao}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{usuario?.email}</div>
                <span style={{
                  display: 'inline-block', marginTop: 4, padding: '1px 8px',
                  background: perfilCor + '20', color: perfilCor,
                  borderRadius: 20, fontSize: 10, fontWeight: 600,
                }}>
                  {perfilLabel}
                </span>
              </div>
              <button
                onClick={() => { navigate('/configuracoes'); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px', borderRadius: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text)', fontSize: 13,
                }}
              >
                <Settings size={15} /> Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px', borderRadius: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#ef4444', fontSize: 13,
                }}
              >
                <LogOut size={15} /> Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 56, backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 4 }}
            className="mobile-menu-btn"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Nome da clínica */}
          {usuario?.clinica && (
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {(usuario.clinica as { nome?: string }).nome}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {/* Notificações */}
          <button
            onClick={() => navigate('/financeiro')}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8 }}
            title="Cobranças pendentes"
          >
            <Bell size={20} />
            {pendencias > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2, width: 16, height: 16,
                background: 'var(--color-error)', borderRadius: 8,
                fontSize: 10, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pendencias}
              </span>
            )}
          </button>

          {/* Tema */}
          <button
            onClick={toggleTema}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8 }}
            title={state.tema === 'light' ? 'Modo escuro' : 'Modo claro'}
          >
            {state.tema === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Configurações */}
          <button
            onClick={() => navigate('/configuracoes')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8 }}
            title="Configurações"
          >
            <Settings size={20} />
          </button>

          {/* Logout rápido */}
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6, borderRadius: 8 }}
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--color-bg)' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
