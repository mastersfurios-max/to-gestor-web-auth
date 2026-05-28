import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Activity, ClipboardList, ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, PageHeader, Input, Select, EmptyState } from '../components/ui';
import { formatDateBR, gerarId, hoje } from '../utils';
import type { Evolucao, Avaliacao } from '../types';

// ── Formulário de Evolução ─────────────────────────────────────────────────
export function NovaEvolucao() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteIdParam = searchParams.get('pacienteId') || '';
  const atendimentoIdParam = searchParams.get('atendimentoId') || '';

  const pacientesAtivos = state.pacientes.filter(p => p.ativo).sort((a, b) => a.nome.localeCompare(b.nome));

  const [form, setForm] = useState({
    pacienteId: pacienteIdParam,
    data: hoje(),
    queixaPrincipal: '',
    objetivosSessao: '',
    atividadesRealizadas: '',
    respostaPaciente: '',
    planejamentoProximaSessao: '',
    observacoes: '',
  });

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pacienteId || !form.objetivosSessao || !form.atividadesRealizadas || !form.respostaPaciente) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    const evolucao: Evolucao = {
      id: gerarId(),
      pacienteId: form.pacienteId,
      atendimentoId: atendimentoIdParam || undefined,
      data: form.data,
      queixaPrincipal: form.queixaPrincipal,
      objetivosSessao: form.objetivosSessao,
      atividadesRealizadas: form.atividadesRealizadas,
      respostaPaciente: form.respostaPaciente,
      planejamentoProximaSessao: form.planejamentoProximaSessao,
      observacoes: form.observacoes,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EVOLUCAO', payload: evolucao });
    if (atendimentoIdParam) {
      const at = state.atendimentos.find(a => a.id === atendimentoIdParam);
      if (at) dispatch({ type: 'UPDATE_ATENDIMENTO', payload: { ...at, evolucaoId: evolucao.id } });
    }
    alert('✓ Evolução registrada com sucesso!');
    navigate(-1);
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader title="Nova Evolução Clínica" />
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Select
              label="Paciente *"
              value={form.pacienteId}
              onChange={set('pacienteId')}
              options={[{ value: '', label: 'Selecione...' }, ...pacientesAtivos.map(p => ({ value: p.id, label: p.nome }))]}
              required
            />
            <Input label="Data *" value={form.data} onChange={set('data')} type="date" required />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Queixa Principal" value={form.queixaPrincipal} onChange={set('queixaPrincipal')} as="textarea" rows={2} placeholder="Queixa relatada pelo paciente ou responsável..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Objetivos da Sessão *" value={form.objetivosSessao} onChange={set('objetivosSessao')} as="textarea" rows={2} placeholder="Objetivos terapêuticos desta sessão..." required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Atividades Realizadas *" value={form.atividadesRealizadas} onChange={set('atividadesRealizadas')} as="textarea" rows={3} placeholder="Descreva as atividades e técnicas utilizadas..." required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Resposta do Paciente *" value={form.respostaPaciente} onChange={set('respostaPaciente')} as="textarea" rows={2} placeholder="Como o paciente respondeu às atividades..." required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Planejamento da Próxima Sessão" value={form.planejamentoProximaSessao} onChange={set('planejamentoProximaSessao')} as="textarea" rows={2} placeholder="Objetivos e atividades para a próxima sessão..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Observações Adicionais" value={form.observacoes} onChange={set('observacoes')} as="textarea" rows={2} placeholder="Outras observações relevantes..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <Button variant="secondary" onClick={() => navigate(-1)} type="button">Cancelar</Button>
            <Button type="submit"><Save size={14} /> Salvar Evolução</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

// ── Formulário de Avaliação ────────────────────────────────────────────────
const TIPOS_AVALIACAO = [
  'MIF - Medida de Independência Funcional', 'Índice de Barthel', 'COPM - Canadian Occupational Performance Measure',
  'Escala de Fugl-Meyer', 'MMSE - Mini-Exame do Estado Mental', 'Escala de Ashworth Modificada',
  'Avaliação Sensorial', 'Avaliação Motora Fina', 'Avaliação Motora Grossa',
  'Avaliação de AVDs', 'Avaliação de AIVDs', 'Avaliação Cognitiva', 'Avaliação Perceptual', 'Avaliação Personalizada',
];

export function NovaAvaliacao() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteIdParam = searchParams.get('pacienteId') || '';

  const pacientesAtivos = state.pacientes.filter(p => p.ativo).sort((a, b) => a.nome.localeCompare(b.nome));

  const [form, setForm] = useState({
    pacienteId: pacienteIdParam,
    data: hoje(),
    tipo: TIPOS_AVALIACAO[0],
    resultado: '',
    pontuacao: '',
    observacoes: '',
  });

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pacienteId || !form.resultado) { alert('Preencha os campos obrigatórios.'); return; }
    const avaliacao: Avaliacao = {
      id: gerarId(),
      pacienteId: form.pacienteId,
      data: form.data,
      tipo: form.tipo,
      resultado: form.resultado,
      pontuacao: form.pontuacao ? Number(form.pontuacao) : undefined,
      observacoes: form.observacoes,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_AVALIACAO', payload: avaliacao });
    alert('✓ Avaliação registrada com sucesso!');
    navigate(-1);
  }

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader title="Nova Avaliação Funcional" />
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Select
              label="Paciente *"
              value={form.pacienteId}
              onChange={set('pacienteId')}
              options={[{ value: '', label: 'Selecione...' }, ...pacientesAtivos.map(p => ({ value: p.id, label: p.nome }))]}
              required
            />
            <Input label="Data *" value={form.data} onChange={set('data')} type="date" required />
            <div style={{ gridColumn: '1 / -1' }}>
              <Select
                label="Tipo de Avaliação *"
                value={form.tipo}
                onChange={set('tipo')}
                options={TIPOS_AVALIACAO.map(t => ({ value: t, label: t }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Resultado / Descrição *" value={form.resultado} onChange={set('resultado')} as="textarea" rows={4} placeholder="Descreva os resultados da avaliação..." required />
            </div>
            <Input label="Pontuação (se aplicável)" value={form.pontuacao} onChange={set('pontuacao')} type="number" placeholder="Ex: 85" />
            <Input label="Observações" value={form.observacoes} onChange={set('observacoes')} placeholder="Observações adicionais..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <Button variant="secondary" onClick={() => navigate(-1)} type="button">Cancelar</Button>
            <Button type="submit"><Save size={14} /> Salvar Avaliação</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

// ── Página Principal Clínico ───────────────────────────────────────────────
export default function Clinico() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'evolucoes' | 'avaliacoes'>('evolucoes');
  const [busca, setBusca] = useState('');

  const evolucoes = useMemo(() =>
    state.evolucoes
      .filter(e => !busca || e.pacienteId && state.pacientes.find(p => p.id === e.pacienteId)?.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => b.data.localeCompare(a.data)),
    [state.evolucoes, state.pacientes, busca]
  );

  const avaliacoes = useMemo(() =>
    state.avaliacoes
      .filter(a => !busca || state.pacientes.find(p => p.id === a.pacienteId)?.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => b.data.localeCompare(a.data)),
    [state.avaliacoes, state.pacientes, busca]
  );

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <PageHeader
        title="Módulo Clínico"
        subtitle={`${state.evolucoes.length} evoluções · ${state.avaliacoes.length} avaliações`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/clinico/nova-avaliacao')}>
              <ClipboardList size={14} /> Nova Avaliação
            </Button>
            <Button onClick={() => navigate('/clinico/nova-evolucao')}>
              <Plus size={14} /> Nova Evolução
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid var(--color-border)', marginBottom: 20 }}>
        {[{ key: 'evolucoes', label: `Evoluções (${state.evolucoes.length})`, icon: <Activity size={15} /> },
          { key: 'avaliacoes', label: `Avaliações (${state.avaliacoes.length})`, icon: <ClipboardList size={15} /> }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'evolucoes' | 'avaliacoes')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: 'transparent',
              borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              marginBottom: -2,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 360 }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por paciente..."
          style={{
            width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8,
            border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
          }}
        />
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14 }}>🔍</span>
      </div>

      {/* Evoluções */}
      {tab === 'evolucoes' && (
        evolucoes.length === 0 ? (
          <EmptyState icon={<Activity />} title="Nenhuma evolução registrada" action={<Button onClick={() => navigate('/clinico/nova-evolucao')}><Plus size={14} /> Nova Evolução</Button>} />
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {evolucoes.map(ev => {
              const paciente = state.pacientes.find(p => p.id === ev.pacienteId);
              return (
                <Card key={ev.id} onClick={() => navigate(`/pacientes/${ev.pacienteId}?tab=2`)} style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{paciente?.nome || 'Paciente'}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{formatDateBR(ev.data)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>
                    <strong>Objetivos:</strong> {ev.objetivosSessao}
                  </div>
                  {ev.atividadesRealizadas && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.atividadesRealizadas}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Avaliações */}
      {tab === 'avaliacoes' && (
        avaliacoes.length === 0 ? (
          <EmptyState icon={<ClipboardList />} title="Nenhuma avaliação registrada" action={<Button onClick={() => navigate('/clinico/nova-avaliacao')}><Plus size={14} /> Nova Avaliação</Button>} />
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {avaliacoes.map(av => {
              const paciente = state.pacientes.find(p => p.id === av.pacienteId);
              return (
                <Card key={av.id} onClick={() => navigate(`/pacientes/${av.pacienteId}?tab=1`)} style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{paciente?.nome || 'Paciente'}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>{av.tipo}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{formatDateBR(av.data)}</div>
                    </div>
                    {av.pontuacao !== undefined && (
                      <div style={{ background: 'var(--color-primary)20', borderRadius: 20, padding: '4px 14px', fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>
                        {av.pontuacao} pts
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)', marginTop: 8, lineHeight: 1.6 }}>{av.resultado}</div>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
