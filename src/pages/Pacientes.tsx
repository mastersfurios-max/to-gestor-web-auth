import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User, ChevronRight, Phone, Mail } from 'lucide-react';
import { useApp } from '../context';
import { Card, PageHeader, Button, Badge, EmptyState } from '../components/ui';
import { calcularIdade, CATEGORIA_DIAG_COLORS, CATEGORIA_DIAG_LABELS } from '../utils';

export default function Pacientes() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'ativos' | 'inativos' | 'todos'>('ativos');

  const pacientesFiltrados = useMemo(() => {
    return state.pacientes
      .filter(p => {
        if (filtroAtivo === 'ativos') return p.ativo;
        if (filtroAtivo === 'inativos') return !p.ativo;
        return true;
      })
      .filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.diagnosticoPrincipal.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [state.pacientes, busca, filtroAtivo]);

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader
        title="Pacientes"
        subtitle={`${state.pacientes.filter(p => p.ativo).length} pacientes ativos`}
        actions={
          <Button onClick={() => navigate('/pacientes/novo')}>
            <Plus size={16} /> Novo Paciente
          </Button>
        }
      />

      {/* Filtros e busca */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou diagnóstico..."
            style={{
              width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8,
              border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface2)', borderRadius: 8, padding: 4 }}>
          {(['ativos', 'inativos', 'todos'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroAtivo(f)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: filtroAtivo === f ? 'var(--color-surface)' : 'transparent',
                color: filtroAtivo === f ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: filtroAtivo === f ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {pacientesFiltrados.length === 0 ? (
        <EmptyState
          icon={<User />}
          title="Nenhum paciente encontrado"
          description={busca ? 'Tente outro termo de busca.' : 'Cadastre o primeiro paciente.'}
          action={<Button onClick={() => navigate('/pacientes/novo')}><Plus size={14} /> Novo Paciente</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pacientesFiltrados.map(p => {
            const cor = CATEGORIA_DIAG_COLORS[p.categoriaDiagnostico] || '#6B7280';
            return (
              <Card
                key={p.id}
                onClick={() => navigate(`/pacientes/${p.id}`)}
                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
              >
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: 22, flexShrink: 0,
                  background: cor + '22', border: `2px solid ${cor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: cor,
                }}>
                  {p.nome.charAt(0)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{p.nome}</span>
                    {!p.ativo && <Badge label="Inativo" color="#6B7280" />}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {calcularIdade(p.dataNascimento)} anos · {p.diagnosticoPrincipal}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                    {p.telefone && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={11} /> {p.telefone}
                      </span>
                    )}
                    {p.email && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Mail size={11} /> {p.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Categoria */}
                <Badge label={CATEGORIA_DIAG_LABELS[p.categoriaDiagnostico]} color={cor} />
                <ChevronRight size={16} color="var(--color-text-muted)" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
