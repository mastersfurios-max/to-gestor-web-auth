import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, Activity, ClipboardList, Plus } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, Badge } from '../components/ui';
import { calcularIdade, formatDateBR, formatCurrency, STATUS_AT_COLORS, STATUS_AT_LABELS, STATUS_PAG_COLORS, STATUS_PAG_LABELS, TIPO_LABELS, CATEGORIA_DIAG_COLORS, CATEGORIA_DIAG_LABELS } from '../utils';

const TABS = ['Dados', 'Avaliações', 'Evoluções', 'Atendimentos', 'Financeiro'];

export default function PacienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const paciente = state.pacientes.find(p => p.id === id);
  const atendimentos = useMemo(() => state.atendimentos.filter(a => a.pacienteId === id).sort((a, b) => b.data.localeCompare(a.data)), [state.atendimentos, id]);
  const evolucoes = useMemo(() => state.evolucoes.filter(e => e.pacienteId === id).sort((a, b) => b.data.localeCompare(a.data)), [state.evolucoes, id]);
  const avaliacoes = useMemo(() => state.avaliacoes.filter(a => a.pacienteId === id).sort((a, b) => b.data.localeCompare(a.data)), [state.avaliacoes, id]);
  const cobrancas = useMemo(() => state.cobrancas.filter(c => c.pacienteId === id).sort((a, b) => b.data.localeCompare(a.data)), [state.cobrancas, id]);

  if (!paciente) return <div style={{ padding: 24 }}>Paciente não encontrado.</div>;

  const _cor = CATEGORIA_DIAG_COLORS[paciente.categoriaDiagnostico] || '#6B7280'; void _cor;
  const totalPago = cobrancas.filter(c => c.status === 'pago').reduce((a, c) => a + c.valor, 0);
  const totalPendente = cobrancas.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((a, c) => a + c.valor, 0);

  function inativar() {
    if (!confirm(`Inativar ${paciente!.nome}? O histórico será preservado.`)) return;
    dispatch({ type: 'DELETE_PACIENTE', payload: paciente!.id });
    navigate('/pacientes');
  }

  function reativar() {
    dispatch({ type: 'UPDATE_PACIENTE', payload: { ...paciente!, ativo: true } });
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/pacientes')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>{paciente.nome}</h1>
            {!paciente.ativo && <Badge label="Inativo" color="#6B7280" />}
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            {calcularIdade(paciente.dataNascimento)} anos · {CATEGORIA_DIAG_LABELS[paciente.categoriaDiagnostico]}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => navigate(`/pacientes/${id}/relatorio`)}>
            <FileText size={14} /> Relatório
          </Button>
          {!paciente.ativo ? (
            <Button variant="success" onClick={reativar}><Activity size={14} /> Reativar</Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate(`/pacientes/${id}/editar`)}>
              <Edit size={14} /> Editar
            </Button>
          )}
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid var(--color-border)', marginBottom: 24 }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: 'transparent', borderBottom: tab === i ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: tab === i ? 'var(--color-primary)' : 'var(--color-text-muted)',
              marginBottom: -2,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Dados */}
      {tab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Dados Pessoais</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Nome Completo', value: paciente.nome },
                { label: 'Data de Nascimento', value: `${formatDateBR(paciente.dataNascimento)} (${calcularIdade(paciente.dataNascimento)} anos)` },
                { label: 'CPF', value: paciente.cpf || '—' },
                { label: 'Telefone', value: paciente.telefone || '—' },
                { label: 'E-mail', value: paciente.email || '—' },
                { label: 'Endereço', value: paciente.endereco || '—' },
                { label: 'Responsável', value: paciente.responsavel || '—' },
                { label: 'Tel. Responsável', value: paciente.telefoneResponsavel || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', minWidth: 120 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', textAlign: 'right', flex: 1 }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Dados Clínicos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Diagnóstico', value: paciente.diagnosticoPrincipal },
                { label: 'Categoria', value: CATEGORIA_DIAG_LABELS[paciente.categoriaDiagnostico] },
                { label: 'CID', value: paciente.cid || '—' },
                { label: 'Plano de Saúde', value: paciente.planoSaude || '—' },
                { label: 'Carteirinha', value: paciente.numeroCarteirinha || '—' },
                { label: 'Cadastro', value: formatDateBR(paciente.dataCadastro) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', minWidth: 120 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', textAlign: 'right', flex: 1 }}>{value}</span>
                </div>
              ))}
            </div>
            {paciente.observacoes && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--color-surface2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>OBSERVAÇÕES</div>
                <div style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.6 }}>{paciente.observacoes}</div>
              </div>
            )}
          </Card>

          {/* Resumo estatístico */}
          <Card style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Resumo do Tratamento</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Total de Sessões', value: atendimentos.length, color: 'var(--color-primary)' },
                { label: 'Realizadas', value: atendimentos.filter(a => a.status === 'realizado').length, color: 'var(--color-success)' },
                { label: 'Canceladas', value: atendimentos.filter(a => a.status === 'cancelado').length, color: 'var(--color-error)' },
                { label: 'Evoluções', value: evolucoes.length, color: '#6366F1' },
                { label: 'Avaliações', value: avaliacoes.length, color: '#F59E0B' },
                { label: 'Total Pago', value: formatCurrency(totalPago), color: 'var(--color-success)' },
                { label: 'Pendente', value: formatCurrency(totalPendente), color: 'var(--color-warning)' },
              ].map(item => (
                <div key={item.label} style={{ flex: '1 1 120px', textAlign: 'center', padding: '12px 8px', background: 'var(--color-surface2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Avaliações */}
      {tab === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button onClick={() => navigate(`/clinico/nova-avaliacao?pacienteId=${id}`)}>
              <Plus size={14} /> Nova Avaliação
            </Button>
          </div>
          {avaliacoes.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              <ClipboardList size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div>Nenhuma avaliação registrada</div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {avaliacoes.map(av => (
                <Card key={av.id} style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{av.tipo}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{formatDateBR(av.data)}</div>
                    </div>
                    {av.pontuacao !== undefined && (
                      <div style={{ background: 'var(--color-primary)20', borderRadius: 20, padding: '4px 12px', fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>
                        {av.pontuacao} pts
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{av.resultado}</div>
                  {av.observacoes && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, fontStyle: 'italic' }}>{av.observacoes}</div>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Evoluções */}
      {tab === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button onClick={() => navigate(`/clinico/nova-evolucao?pacienteId=${id}`)}>
              <Plus size={14} /> Nova Evolução
            </Button>
          </div>
          {evolucoes.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              <Activity size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div>Nenhuma evolução registrada</div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {evolucoes.map(ev => (
                <Card key={ev.id} style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>{formatDateBR(ev.data)}</div>
                  {ev.queixaPrincipal && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Queixa Principal</div>
                      <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{ev.queixaPrincipal}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Objetivos</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{ev.objetivosSessao}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Atividades Realizadas</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{ev.atividadesRealizadas}</div>
                  </div>
                  <div style={{ marginBottom: ev.planejamentoProximaSessao ? 10 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Resposta do Paciente</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{ev.respostaPaciente}</div>
                  </div>
                  {ev.planejamentoProximaSessao && (
                    <div style={{ background: 'var(--color-primary)10', borderRadius: 8, padding: 12, marginTop: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Próxima Sessão</div>
                      <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6 }}>{ev.planejamentoProximaSessao}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Atendimentos */}
      {tab === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button onClick={() => navigate(`/agenda/novo?pacienteId=${id}`)}>
              <Plus size={14} /> Novo Agendamento
            </Button>
          </div>
          {atendimentos.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              <Calendar size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div>Nenhum atendimento registrado</div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {atendimentos.map(at => {
                const cor = STATUS_AT_COLORS[at.status];
                return (
                  <Card
                    key={at.id}
                    onClick={() => navigate(`/agenda/${at.id}`)}
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ width: 3, height: 40, backgroundColor: cor, borderRadius: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                        {formatDateBR(at.data)} · {at.horarioInicio}–{at.horarioFim}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
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
      )}

      {/* Tab: Financeiro */}
      {tab === 4 && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: 'var(--color-success)15', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--color-success)33' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Total Pago</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success)' }}>{formatCurrency(totalPago)}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--color-warning)15', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--color-warning)33' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>Pendente</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-warning)' }}>{formatCurrency(totalPendente)}</div>
            </div>
          </div>
          {cobrancas.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              <DollarSign size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div>Nenhuma cobrança registrada</div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {cobrancas.map(c => {
                const cor = STATUS_PAG_COLORS[c.status];
                return (
                  <Card key={c.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 3, height: 40, backgroundColor: cor, borderRadius: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{formatDateBR(c.data)}</div>
                      {c.formaPagamento && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{c.formaPagamento.replace('_', ' ')}</div>}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>{formatCurrency(c.valor)}</div>
                    <Badge label={STATUS_PAG_LABELS[c.status]} color={cor} />
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Botão inativar */}
      {paciente.ativo && (
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
          <Button variant="danger" onClick={inativar}>Inativar Paciente</Button>
        </div>
      )}
    </div>
  );
}
