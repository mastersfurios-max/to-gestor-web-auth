import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, UserCheck, FileText, DollarSign } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, Badge } from '../components/ui';
import { formatDateBR, formatCurrency, STATUS_AT_COLORS, STATUS_AT_LABELS, TIPO_LABELS } from '../utils';

export default function AtendimentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const atendimento = state.atendimentos.find(a => a.id === id);
  const evolucao = atendimento?.evolucaoId ? state.evolucoes.find(e => e.id === atendimento.evolucaoId) : null;
  const cobranca = state.cobrancas.find(c => c.atendimentoId === id);

  if (!atendimento) return <div style={{ padding: 24 }}>Atendimento não encontrado.</div>;

  const at = atendimento;
  const cor = STATUS_AT_COLORS[at.status];

  function confirmarPresenca() {
    if (!confirm('Confirmar presença do paciente?')) return;
    dispatch({ type: 'UPDATE_ATENDIMENTO', payload: { ...at, status: 'confirmado' } });
    alert('✓ Presença confirmada!');
  }

  function marcarRealizado() {
    if (!confirm('Marcar atendimento como realizado?')) return;
    dispatch({ type: 'UPDATE_ATENDIMENTO', payload: { ...at, status: 'realizado' } });
    if (!at.cobrado) {
      const novaCobranca = {
        id: Date.now().toString(36),
        atendimentoId: at.id,
        pacienteId: at.pacienteId,
        pacienteNome: at.pacienteNome,
        data: at.data,
        valor: at.valorSessao,
        status: 'pendente' as const,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_COBRANCA', payload: novaCobranca });
      dispatch({ type: 'UPDATE_ATENDIMENTO', payload: { ...at, status: 'realizado', cobrado: true } });
    }
    alert('✓ Atendimento marcado como realizado! Cobrança gerada.');
  }

  function cancelar() {
    if (!confirm('Cancelar este atendimento?')) return;
    dispatch({ type: 'UPDATE_ATENDIMENTO', payload: { ...at, status: 'cancelado' } });
    navigate('/agenda');
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/agenda')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>Detalhe do Atendimento</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>{atendimento.pacienteNome}</p>
        </div>
        <Badge label={STATUS_AT_LABELS[atendimento.status]} color={cor} />
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Informações</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Paciente', value: atendimento.pacienteNome },
              { label: 'Data', value: formatDateBR(atendimento.data) },
              { label: 'Horário', value: `${atendimento.horarioInicio} – ${atendimento.horarioFim}` },
              { label: 'Tipo', value: TIPO_LABELS[atendimento.tipo] },
              { label: 'Local', value: atendimento.local || '—' },
              { label: 'Valor da Sessão', value: formatCurrency(atendimento.valorSessao) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{value}</div>
              </div>
            ))}
          </div>
          {atendimento.observacoes && (
            <div style={{ marginTop: 14, padding: 12, background: 'var(--color-surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>OBSERVAÇÕES</div>
              <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{atendimento.observacoes}</div>
            </div>
          )}
        </Card>

        {/* Ações */}
        {atendimento.status !== 'cancelado' && atendimento.status !== 'realizado' && (
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Ações</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {atendimento.status === 'pendente' && (
                <Button variant="secondary" onClick={confirmarPresenca}>
                  <UserCheck size={14} /> Confirmar Presença
                </Button>
              )}
              <Button variant="success" onClick={marcarRealizado}>
                <CheckCircle size={14} /> Marcar como Realizado
              </Button>
              <Button variant="danger" onClick={cancelar}>
                <XCircle size={14} /> Cancelar Atendimento
              </Button>
            </div>
          </Card>
        )}

        {/* Evolução */}
        {atendimento.status === 'realizado' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: evolucao ? 16 : 0 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Evolução Clínica</h3>
              {!evolucao && (
                <Button size="sm" onClick={() => navigate(`/clinico/nova-evolucao?atendimentoId=${id}&pacienteId=${atendimento.pacienteId}`)}>
                  <FileText size={13} /> Registrar Evolução
                </Button>
              )}
            </div>
            {evolucao ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {evolucao.queixaPrincipal && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Queixa</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{evolucao.queixaPrincipal}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Objetivos</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{evolucao.objetivosSessao}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Atividades</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{evolucao.atividadesRealizadas}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>Resposta</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{evolucao.respostaPaciente}</div>
                </div>
                {evolucao.planejamentoProximaSessao && (
                  <div style={{ background: 'var(--color-primary)10', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 3 }}>Próxima Sessão</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{evolucao.planejamentoProximaSessao}</div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 14 }}>Nenhuma evolução registrada para este atendimento.</p>
            )}
          </Card>
        )}

        {/* Cobrança */}
        {cobranca && (
          <Card>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Cobrança</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DollarSign size={20} color="var(--color-success)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{formatCurrency(cobranca.valor)}</div>
                {cobranca.dataPagamento && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Pago em {formatDateBR(cobranca.dataPagamento)}</div>}
              </div>
              <Badge
                label={cobranca.status === 'pago' ? 'Pago' : cobranca.status === 'vencido' ? 'Vencido' : 'Pendente'}
                color={cobranca.status === 'pago' ? 'var(--color-success)' : cobranca.status === 'vencido' ? 'var(--color-error)' : 'var(--color-warning)'}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
