import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context';
import { Card, Button, Badge, Modal, Select, PageHeader, StatCard } from '../components/ui';
import { formatCurrency, formatDateBR, STATUS_PAG_COLORS, STATUS_PAG_LABELS, FORMA_PAG_LABELS } from '../utils';
import type { Cobranca, FormaPagamento } from '../types';

const FORMAS_PAG = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência Bancária' },
  { value: 'plano_saude', label: 'Plano de Saúde' },
];

export default function Financeiro() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalPagamento, setModalPagamento] = useState<Cobranca | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');

  const hoje = new Date().toISOString().split('T')[0];
  const mes = hoje.substring(0, 7);

  const cobrancasFiltradas = useMemo(() =>
    state.cobrancas
      .filter(c => filtroStatus === 'todos' || c.status === filtroStatus)
      .sort((a, b) => b.data.localeCompare(a.data)),
    [state.cobrancas, filtroStatus]
  );

  const receitaMes = useMemo(() =>
    state.cobrancas.filter(c => c.data.startsWith(mes) && c.status === 'pago').reduce((a, c) => a + c.valor, 0),
    [state.cobrancas, mes]
  );
  const pendenteMes = useMemo(() =>
    state.cobrancas.filter(c => c.data.startsWith(mes) && (c.status === 'pendente' || c.status === 'vencido')).reduce((a, c) => a + c.valor, 0),
    [state.cobrancas, mes]
  );
  const totalPago = useMemo(() => state.cobrancas.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor, 0), [state.cobrancas]);
  const totalPendente = useMemo(() => state.cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((a, c) => a + c.valor, 0), [state.cobrancas]);

  // Dados do gráfico (últimos 6 meses)
  const dadosGrafico = useMemo(() => {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mesStr = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const pago = state.cobrancas.filter(c => c.data.startsWith(mesStr) && c.status === 'pago').reduce((a, c) => a + c.valor, 0);
      const pendente = state.cobrancas.filter(c => c.data.startsWith(mesStr) && (c.status === 'pendente' || c.status === 'vencido')).reduce((a, c) => a + c.valor, 0);
      meses.push({ mes: label, pago, pendente });
    }
    return meses;
  }, [state.cobrancas]);

  function confirmarPagamento() {
    if (!modalPagamento) return;
    dispatch({
      type: 'UPDATE_COBRANCA',
      payload: {
        ...modalPagamento,
        status: 'pago',
        formaPagamento,
        dataPagamento: hoje,
      },
    });
    setModalPagamento(null);
    alert(`✓ Pagamento de ${formatCurrency(modalPagamento.valor)} registrado via ${FORMA_PAG_LABELS[formaPagamento]}!`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader
        title="Financeiro"
        subtitle="Controle de cobranças e pagamentos"
        actions={
          <Button onClick={() => navigate('/financeiro/relatorio')}>
            <FileText size={14} /> Relatório Financeiro
          </Button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="Receita do Mês" value={formatCurrency(receitaMes)} sub="Pagamentos confirmados" color="var(--color-success)" icon={<TrendingUp size={20} />} />
        <StatCard label="Pendente do Mês" value={formatCurrency(pendenteMes)} sub="A receber" color="var(--color-warning)" icon={<Clock size={20} />} />
        <StatCard label="Total Recebido" value={formatCurrency(totalPago)} sub="Histórico geral" color="var(--color-primary)" icon={<DollarSign size={20} />} />
        <StatCard label="Total Pendente" value={formatCurrency(totalPendente)} sub={`${state.cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido').length} cobranças`} color="var(--color-error)" icon={<AlertTriangle size={20} />} />
      </div>

      {/* Gráfico */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Receita — Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dadosGrafico} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
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

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--color-surface)', borderRadius: 8, padding: 4, border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {[
          { value: 'todos', label: 'Todas' },
          { value: 'pendente', label: 'Pendentes' },
          { value: 'vencido', label: 'Vencidas' },
          { value: 'pago', label: 'Pagas' },
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

      {/* Lista de cobranças */}
      <div style={{ display: 'grid', gap: 8 }}>
        {cobrancasFiltradas.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <DollarSign size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div>Nenhuma cobrança encontrada</div>
          </Card>
        ) : cobrancasFiltradas.map(c => {
          const cor = STATUS_PAG_COLORS[c.status];
          return (
            <Card key={c.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `3px solid ${cor}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{c.pacienteNome}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {formatDateBR(c.data)}
                  {c.formaPagamento && ` · ${FORMA_PAG_LABELS[c.formaPagamento]}`}
                  {c.dataPagamento && ` · Pago em ${formatDateBR(c.dataPagamento)}`}
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)' }}>{formatCurrency(c.valor)}</div>
              <Badge label={STATUS_PAG_LABELS[c.status]} color={cor} />
              {(c.status === 'pendente' || c.status === 'vencido') && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => { setModalPagamento(c); setFormaPagamento('pix'); }}
                >
                  <CheckCircle size={13} /> Registrar Pagamento
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal de pagamento */}
      <Modal open={!!modalPagamento} onClose={() => setModalPagamento(null)} title="Registrar Pagamento" width={420}>
        {modalPagamento && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--color-surface2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Paciente</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{modalPagamento.pacienteNome}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)', marginTop: 6 }}>{formatCurrency(modalPagamento.valor)}</div>
            </div>
            <Select
              label="Forma de Pagamento"
              value={formaPagamento}
              onChange={v => setFormaPagamento(v as FormaPagamento)}
              options={FORMAS_PAG}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setModalPagamento(null)}>Cancelar</Button>
              <Button variant="success" onClick={confirmarPagamento}>
                <CheckCircle size={14} /> Confirmar Pagamento
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
