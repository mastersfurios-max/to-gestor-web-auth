import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, Input, Select, PageHeader } from '../components/ui';
import { gerarId, hoje } from '../utils';
import type { Atendimento, TipoAtendimento, StatusAtendimento } from '../types';

const TIPOS = [
  { value: 'individual', label: 'Individual' }, { value: 'grupo', label: 'Grupo' },
  { value: 'domiciliar', label: 'Domiciliar' }, { value: 'hospitalar', label: 'Hospitalar' },
  { value: 'escolar', label: 'Escolar' }, { value: 'teleAtendimento', label: 'Teleatendimento' },
];

export default function AgendaForm() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteIdParam = searchParams.get('pacienteId') || '';

  const pacientesAtivos = state.pacientes.filter(p => p.ativo).sort((a, b) => a.nome.localeCompare(b.nome));

  const [form, setForm] = useState({
    pacienteId: pacienteIdParam,
    data: hoje(),
    horarioInicio: '08:00',
    horarioFim: '08:50',
    tipo: 'individual' as TipoAtendimento,
    local: 'Clínica',
    observacoes: '',
    valorSessao: String(state.terapeuta.valorPadraoPorSessao),
  });

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.pacienteId) { alert('Selecione um paciente.'); return; }
    const paciente = state.pacientes.find(p => p.id === form.pacienteId);
    if (!paciente) return;

    const payload: Atendimento = {
      id: gerarId(),
      pacienteId: form.pacienteId,
      pacienteNome: paciente.nome,
      data: form.data,
      horarioInicio: form.horarioInicio,
      horarioFim: form.horarioFim,
      tipo: form.tipo,
      status: 'pendente' as StatusAtendimento,
      local: form.local,
      observacoes: form.observacoes,
      valorSessao: Number(form.valorSessao) || state.terapeuta.valorPadraoPorSessao,
      cobrado: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ATENDIMENTO', payload });
    navigate('/agenda');
  }

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader title="Novo Agendamento" />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Select
                label="Paciente *"
                value={form.pacienteId}
                onChange={set('pacienteId')}
                options={[{ value: '', label: 'Selecione...' }, ...pacientesAtivos.map(p => ({ value: p.id, label: p.nome }))]}
                required
              />
            </div>
            <Input label="Data *" value={form.data} onChange={set('data')} type="date" required />
            <Select label="Tipo *" value={form.tipo} onChange={v => setForm(f => ({ ...f, tipo: v as TipoAtendimento }))} options={TIPOS} />
            <Input label="Horário Início" value={form.horarioInicio} onChange={set('horarioInicio')} type="time" />
            <Input label="Horário Fim" value={form.horarioFim} onChange={set('horarioFim')} type="time" />
            <Input label="Local" value={form.local} onChange={set('local')} placeholder="Ex: Clínica, Domicílio..." />
            <Input label="Valor da Sessão (R$)" value={form.valorSessao} onChange={set('valorSessao')} type="number" placeholder="120" />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Observações" value={form.observacoes} onChange={set('observacoes')} as="textarea" rows={2} placeholder="Observações sobre o agendamento..." />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <Button variant="secondary" onClick={() => navigate(-1)} type="button">Cancelar</Button>
            <Button type="submit"><Save size={14} /> Agendar</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
