import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, AlertTriangle, Plus, Lightbulb, Clock } from 'lucide-react';
import { useApp } from '../context';
import { Card, StatCard, Badge } from '../components/ui';
import { formatCurrency, formatDateBR, STATUS_AT_COLORS, STATUS_AT_LABELS, TIPO_LABELS } from '../utils';

export default function Dashboard() {
  const { state } = useApp();
  const navigate = useNavigate();

  const hoje = new Date().toISOString().split('T')[0];
  const diaSemana = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const atendimentosHoje = useMemo(() =>
    state.atendimentos
      .filter(a => a.data === hoje)
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio)),
    [state.atendimentos, hoje]
  );

  const proximosSemana = useMemo(() => {
    const fim = new Date(); fim.setDate(fim.getDate() + 7);
    const fimStr = fim.toISOString().split('T')[0];
    return state.atendimentos
      .filter(a => a.data > hoje && a.data <= fimStr && a.status !== 'cancelado')
      .sort((a, b) => a.data.localeCompare(b.data) || a.horarioInicio.localeCompare(b.horarioInicio))
      .slice(0, 5);
  }, [state.atendimentos, hoje]);

  const pacientesAtivos = state.pacientes.filter(p => p.ativo).length;
  const receitaMes = useMemo(() => {
    const mes = hoje.substring(0, 7);
    return state.cobrancas.filter(c => c.data.startsWith(mes) && c.status === 'pago').reduce((a, c) => a + c.valor, 0);
  }, [state.cobrancas, hoje]);

  const pendencias = state.cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido');
  const totalPendente = pendencias.reduce((a, c) => a + c.valor, 0);

  const realizadosHoje = atendimentosHoje.filter(a => a.status === 'realizado').length;
  const confirmadosHoje = atendimentosHoje.filter(a => a.status === 'confirmado').length;

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      {/* Saudação */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--color-text)' }}>
          Bom dia, {state.terapeuta.nome.split(' ')[1] || state.terapeuta.nome}! 👋
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 14, textTransform: 'capitalize' }}>
          {diaSemana}, {dataFormatada}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard
          label="Atendimentos Hoje"
          value={atendimentosHoje.length}
          sub={`${realizadosHoje} realizados · ${confirmadosHoje} confirmados`}
          color="var(--color-primary)"
          icon={<Calendar size={20} />}
        />
        <StatCard
          label="Pacientes Ativos"
          value={pacientesAtivos}
          sub={`${state.pacientes.length} total`}
          color="#6366F1"
          icon={<Users size={20} />}
        />
        <StatCard
          label="Receita do Mês"
          value={formatCurrency(receitaMes)}
          sub="Pagamentos confirmados"
          color="var(--color-success)"
          icon={<DollarSign size={20} />}
        />
        <StatCard
          label="Pendências"
          value={formatCurrency(totalPendente)}
          sub={`${pendencias.length} cobranças em aberto`}
          color={pendencias.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'}
          icon={<AlertTriangle size={20} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Atendimentos de hoje */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
              Atendimentos de Hoje
            </h3>
            <button
              onClick={() => navigate('/agenda')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}
            >
              Ver agenda →
            </button>
          </div>
          {atendimentosHoje.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Calendar size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 14 }}>Nenhum atendimento hoje</div>
            </div>
          ) : (
            <div>
              {atendimentosHoje.map(at => {
                const cor = STATUS_AT_COLORS[at.status];
                return (
                  <div
                    key={at.id}
                    onClick={() => navigate(`/agenda/${at.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 20px', borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                  >
                    <div style={{ width: 3, height: 40, backgroundColor: cor, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ width: 52, flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{at.horarioInicio}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{at.horarioFim}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {at.pacienteNome}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {TIPO_LABELS[at.tipo]}{at.local ? ` · ${at.local}` : ''}
                      </div>
                    </div>
                    <Badge label={STATUS_AT_LABELS[at.status]} color={cor} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Próximos atendimentos */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
              Próximos 7 Dias
            </h3>
            <button
              onClick={() => navigate('/agenda/novo')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} /> Novo
            </button>
          </div>
          {proximosSemana.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Clock size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 14 }}>Nenhum agendamento</div>
            </div>
          ) : (
            <div>
              {proximosSemana.map(at => (
                <div
                  key={at.id}
                  onClick={() => navigate(`/agenda/${at.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                >
                  <div style={{ width: 44, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      {new Date(at.data + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                      {at.data.split('-')[2]}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {at.pacienteNome}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{at.horarioInicio} · {TIPO_LABELS[at.tipo]}</div>
                  </div>
                  <Badge label={STATUS_AT_LABELS[at.status]} color={STATUS_AT_COLORS[at.status]} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Ações rápidas */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Ações Rápidas</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Novo Paciente', icon: <Users size={18} />, to: '/pacientes/novo', color: '#6366F1' },
            { label: 'Novo Agendamento', icon: <Calendar size={18} />, to: '/agenda/novo', color: 'var(--color-primary)' },
            { label: 'Sugestões de Atividades', icon: <Lightbulb size={18} />, to: '/sugestoes', color: '#F59E0B' },
            { label: 'Relatório Financeiro', icon: <DollarSign size={18} />, to: '/financeiro/relatorio', color: 'var(--color-success)' },
          ].map(item => (
            <Card
              key={item.to}
              onClick={() => navigate(item.to)}
              style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: '1 1 180px' }}
            >
              <div style={{ color: item.color }}>{item.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Pendências financeiras */}
      {pendencias.length > 0 && (
        <Card style={{ padding: 0, overflow: 'hidden', borderColor: 'var(--color-warning)' }}>
          <div style={{ padding: '12px 20px', background: 'var(--color-warning)22', borderBottom: '1px solid var(--color-warning)44', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--color-warning)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-warning)' }}>
              {pendencias.length} cobranças pendentes — {formatCurrency(totalPendente)}
            </span>
            <button
              onClick={() => navigate('/financeiro')}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600 }}
            >
              Ver todas →
            </button>
          </div>
          {pendencias.slice(0, 3).map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--color-border)', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{c.pacienteNome}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 8 }}>{formatDateBR(c.data)}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(c.valor)}</span>
              <Badge label={c.status === 'vencido' ? 'Vencido' : 'Pendente'} color={c.status === 'vencido' ? 'var(--color-error)' : 'var(--color-warning)'} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
