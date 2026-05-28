import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, Badge, EmptyState } from '../components/ui';
import { STATUS_AT_COLORS, STATUS_AT_LABELS, TIPO_LABELS } from '../utils';

function getWeekDays(baseDate: Date) {
  const days = [];
  const start = new Date(baseDate);
  const dow = start.getDay();
  start.setDate(start.getDate() - dow + (dow === 0 ? -6 : 1)); // Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function Agenda() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [baseDate, setBaseDate] = useState(new Date());
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);
  const hoje = new Date().toISOString().split('T')[0];

  const atendimentosSemana = useMemo(() => {
    const start = weekDays[0].toISOString().split('T')[0];
    const end = weekDays[6].toISOString().split('T')[0];
    return state.atendimentos
      .filter(a => a.data >= start && a.data <= end)
      .filter(a => filtroStatus === 'todos' || a.status === filtroStatus)
      .sort((a, b) => a.data.localeCompare(b.data) || a.horarioInicio.localeCompare(b.horarioInicio));
  }, [state.atendimentos, weekDays, filtroStatus]);

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };
  const goToday = () => setBaseDate(new Date());

  const weekLabel = `${weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>Agenda</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>{weekLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="secondary" size="sm" onClick={goToday}>Hoje</Button>
          <button onClick={prevWeek} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', color: 'var(--color-text)', display: 'flex' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextWeek} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', color: 'var(--color-text)', display: 'flex' }}>
            <ChevronRight size={16} />
          </button>
          <Button onClick={() => navigate('/agenda/novo')}><Plus size={14} /> Novo Agendamento</Button>
        </div>
      </div>

      {/* Mini calendário semanal */}
      <Card style={{ padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {weekDays.map(d => {
            const dateStr = d.toISOString().split('T')[0];
            const isHoje = dateStr === hoje;
            const count = state.atendimentos.filter(a => a.data === dateStr).length;
            return (
              <div
                key={dateStr}
                onClick={() => setBaseDate(d)}
                style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                  background: isHoje ? 'var(--color-primary)' : 'transparent',
                  border: isHoje ? 'none' : '1px solid transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isHoje) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface2)'; }}
                onMouseLeave={e => { if (!isHoje) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ fontSize: 11, color: isHoje ? '#ffffffaa' : 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: isHoje ? '#fff' : 'var(--color-text)', lineHeight: 1 }}>
                  {d.getDate()}
                </div>
                {count > 0 && (
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <div key={i} style={{ width: 5, height: 5, borderRadius: 3, background: isHoje ? '#fff' : 'var(--color-primary)' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--color-surface)', borderRadius: 8, padding: 4, border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'confirmado', label: 'Confirmados' },
          { value: 'pendente', label: 'Pendentes' },
          { value: 'realizado', label: 'Realizados' },
          { value: 'cancelado', label: 'Cancelados' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFiltroStatus(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filtroStatus === f.value ? 'var(--color-primary)' : 'transparent',
              color: filtroStatus === f.value ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de atendimentos */}
      {atendimentosSemana.length === 0 ? (
        <EmptyState
          icon={<Calendar />}
          title="Nenhum atendimento nesta semana"
          description="Agende uma sessão para começar."
          action={<Button onClick={() => navigate('/agenda/novo')}><Plus size={14} /> Novo Agendamento</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {atendimentosSemana.map(at => {
            const cor = STATUS_AT_COLORS[at.status];
            const isHoje = at.data === hoje;
            return (
              <Card
                key={at.id}
                onClick={() => navigate(`/agenda/${at.id}`)}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `3px solid ${cor}` }}
              >
                {/* Data */}
                <div style={{ width: 52, flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    {new Date(at.data + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: isHoje ? 'var(--color-primary)' : 'var(--color-text)', lineHeight: 1 }}>
                    {at.data.split('-')[2]}
                  </div>
                  {isHoje && <div style={{ fontSize: 9, color: 'var(--color-primary)', fontWeight: 700 }}>HOJE</div>}
                </div>

                {/* Horário */}
                <div style={{ width: 60, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{at.horarioInicio}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{at.horarioFim}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {at.pacienteNome}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {TIPO_LABELS[at.tipo]}{at.local ? ` · ${at.local}` : ''}
                  </div>
                </div>

                <Badge label={STATUS_AT_LABELS[at.status]} color={cor} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
