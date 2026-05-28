import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context';
import { Card, Button, PageHeader } from '../components/ui';
import { formatCurrency, FORMA_PAG_LABELS } from '../utils';

const CORES_PIE = ['#0a7ea4', '#27AE60', '#F59E0B', '#6366F1', '#EC4899', '#EF4444'];

export default function RelatorioFinanceiro() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState(6);

  // const hoje = new Date().toISOString().split('T')[0];

  // Dados mensais
  const dadosMensais = useMemo(() => {
    const meses = [];
    for (let i = periodo - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mesStr = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const pago = state.cobrancas.filter(c => c.data.startsWith(mesStr) && c.status === 'pago').reduce((a, c) => a + c.valor, 0);
      const pendente = state.cobrancas.filter(c => c.data.startsWith(mesStr) && (c.status === 'pendente' || c.status === 'vencido')).reduce((a, c) => a + c.valor, 0);
      const sessoes = state.atendimentos.filter(a => a.data.startsWith(mesStr) && a.status === 'realizado').length;
      meses.push({ mes: label, pago, pendente, sessoes });
    }
    return meses;
  }, [state.cobrancas, state.atendimentos, periodo]);

  // Por forma de pagamento
  const porFormaPag = useMemo(() => {
    const map: Record<string, number> = {};
    state.cobrancas.filter(c => c.status === 'pago' && c.formaPagamento).forEach(c => {
      const k = c.formaPagamento!;
      map[k] = (map[k] || 0) + c.valor;
    });
    return Object.entries(map).map(([key, value]) => ({ name: FORMA_PAG_LABELS[key] || key, value })).sort((a, b) => b.value - a.value);
  }, [state.cobrancas]);

  // Por paciente (top 10)
  const porPaciente = useMemo(() => {
    const map: Record<string, { nome: string; pago: number; pendente: number }> = {};
    state.cobrancas.forEach(c => {
      if (!map[c.pacienteId]) map[c.pacienteId] = { nome: c.pacienteNome, pago: 0, pendente: 0 };
      if (c.status === 'pago') map[c.pacienteId].pago += c.valor;
      else if (c.status === 'pendente' || c.status === 'vencido') map[c.pacienteId].pendente += c.valor;
    });
    return Object.values(map).sort((a, b) => b.pago - a.pago).slice(0, 10);
  }, [state.cobrancas]);

  const totalPago = state.cobrancas.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor, 0);
  const totalPendente = state.cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((a, c) => a + c.valor, 0);
  const totalSessoes = state.atendimentos.filter(a => a.status === 'realizado').length;
  const ticketMedio = totalSessoes > 0 ? totalPago / totalSessoes : 0;

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/financeiro')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader
          title="Relatório Financeiro"
          subtitle={`Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
          actions={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface)', borderRadius: 8, padding: 4, border: '1px solid var(--color-border)' }}>
                {[3, 6, 12].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    style={{
                      padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: periodo === p ? 'var(--color-primary)' : 'transparent',
                      color: periodo === p ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {p}M
                  </button>
                ))}
              </div>
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer size={14} /> Imprimir
              </Button>
            </div>
          }
        />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Recebido', value: formatCurrency(totalPago), color: 'var(--color-success)', bg: 'var(--color-success)15' },
          { label: 'Total Pendente', value: formatCurrency(totalPendente), color: 'var(--color-warning)', bg: 'var(--color-warning)15' },
          { label: 'Sessões Realizadas', value: totalSessoes, color: 'var(--color-primary)', bg: 'var(--color-primary)15' },
          { label: 'Ticket Médio', value: formatCurrency(ticketMedio), color: '#6366F1', bg: '#6366F115' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: '16px 18px', border: `1px solid ${k.color}33` }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras mensal */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>
          Receita Mensal — Últimos {periodo} Meses
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dadosMensais} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: unknown) => formatCurrency(v as number)}
              contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }}
            />
            <Bar dataKey="pago" name="Recebido" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendente" name="Pendente" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Por forma de pagamento */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Por Forma de Pagamento</h3>
          {porFormaPag.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Nenhum pagamento registrado.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={porFormaPag} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props: any) => `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {porFormaPag.map((_, i) => <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />)}
                </Pie>
                <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Sessões por mês */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Sessões Realizadas por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosMensais} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="sessoes" name="Sessões" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Por paciente */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Receita por Paciente (Top 10)</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {porPaciente.map((p, i) => (
            <div key={p.nome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--color-primary)20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--color-success)', width: `${Math.max(4, (p.pago / (p.pago + p.pendente || 1)) * 100)}%`, transition: 'width 0.3s' }} />
                  {p.pendente > 0 && <div style={{ height: 4, borderRadius: 2, background: 'var(--color-warning)', width: `${(p.pendente / (p.pago + p.pendente)) * 100}%` }} />}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-success)' }}>{formatCurrency(p.pago)}</div>
                {p.pendente > 0 && <div style={{ fontSize: 12, color: 'var(--color-warning)' }}>+{formatCurrency(p.pendente)} pend.</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
