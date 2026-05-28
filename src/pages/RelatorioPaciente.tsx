import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button } from '../components/ui';
import { formatDateBR, formatCurrency, calcularIdade, CATEGORIA_DIAG_LABELS } from '../utils';

export default function RelatorioPaciente() {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const navigate = useNavigate();

  const paciente = state.pacientes.find(p => p.id === id);
  const atendimentos = useMemo(() => state.atendimentos.filter(a => a.pacienteId === id).sort((a, b) => a.data.localeCompare(b.data)), [state.atendimentos, id]);
  const evolucoes = useMemo(() => state.evolucoes.filter(e => e.pacienteId === id).sort((a, b) => a.data.localeCompare(b.data)), [state.evolucoes, id]);
  const avaliacoes = useMemo(() => state.avaliacoes.filter(a => a.pacienteId === id).sort((a, b) => a.data.localeCompare(b.data)), [state.avaliacoes, id]);
  const cobrancas = useMemo(() => state.cobrancas.filter(c => c.pacienteId === id), [state.cobrancas, id]);

  if (!paciente) return <div style={{ padding: 24 }}>Paciente não encontrado.</div>;

  const totalPago = cobrancas.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor, 0);
  const totalPendente = cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((a, c) => a + c.valor, 0);
  const realizados = atendimentos.filter(a => a.status === 'realizado').length;
  const cancelados = atendimentos.filter(a => a.status === 'cancelado').length;
  const dataInicio = atendimentos.length > 0 ? atendimentos[0].data : null;

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(`/pacientes/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>Relatório Clínico</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={14} /> Imprimir
        </Button>
      </div>

      {/* Identificação */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, flexShrink: 0,
            background: 'var(--color-primary)20', border: '2px solid var(--color-primary)44',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: 'var(--color-primary)',
          }}>
            {paciente.nome.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>{paciente.nome}</h2>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 14 }}>
              {calcularIdade(paciente.dataNascimento)} anos · {CATEGORIA_DIAG_LABELS[paciente.categoriaDiagnostico]} · {paciente.diagnosticoPrincipal}
              {paciente.cid ? ` (${paciente.cid})` : ''}
            </p>
            {paciente.planoSaude && (
              <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                Plano: {paciente.planoSaude}{paciente.numeroCarteirinha ? ` · ${paciente.numeroCarteirinha}` : ''}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Terapeuta</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{state.terapeuta.nome}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{state.terapeuta.registro}</div>
          </div>
        </div>
      </Card>

      {/* Resumo estatístico */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total de Sessões', value: atendimentos.length, color: 'var(--color-primary)' },
          { label: 'Realizadas', value: realizados, color: 'var(--color-success)' },
          { label: 'Evoluções', value: evolucoes.length, color: '#6366F1' },
          { label: 'Avaliações', value: avaliacoes.length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: `${s.color}15`, borderRadius: 12, padding: '14px 16px', border: `1px solid ${s.color}33`, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Período de tratamento */}
      {dataInicio && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Período de Tratamento</h3>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Início</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{formatDateBR(dataInicio)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Última Sessão</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{formatDateBR(atendimentos[atendimentos.length - 1].data)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Taxa de Realização</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success)' }}>
                {atendimentos.length > 0 ? Math.round((realizados / atendimentos.length) * 100) : 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Cancelamentos</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: cancelados > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{cancelados}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Avaliações */}
      {avaliacoes.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Avaliações Funcionais</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {avaliacoes.map(av => (
              <div key={av.id} style={{ padding: '12px 14px', background: 'var(--color-surface2)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{av.tipo}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDateBR(av.data)}</div>
                  </div>
                  {av.pontuacao !== undefined && (
                    <div style={{ background: 'var(--color-primary)20', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: 800, color: 'var(--color-primary)' }}>
                      {av.pontuacao} pts
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6 }}>{av.resultado}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Evoluções */}
      {evolucoes.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Histórico de Evoluções</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {evolucoes.map(ev => (
              <div key={ev.id} style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>{formatDateBR(ev.data)}</div>
                {ev.queixaPrincipal && (
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Queixa: </span>
                    <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{ev.queixaPrincipal}</span>
                  </div>
                )}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Objetivos: </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{ev.objetivosSessao}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Atividades: </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{ev.atividadesRealizadas}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Resposta: </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{ev.respostaPaciente}</span>
                </div>
                {ev.planejamentoProximaSessao && (
                  <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--color-primary)10', borderRadius: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Próxima sessão: </span>
                    <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{ev.planejamentoProximaSessao}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumo financeiro */}
      <Card>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Resumo Financeiro</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: 'var(--color-success)15', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Pago</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success)' }}>{formatCurrency(totalPago)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--color-warning)15', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Pendente</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-warning)' }}>{formatCurrency(totalPendente)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--color-primary)15', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Geral</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(totalPago + totalPendente)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
