import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, Input, Select, PageHeader } from '../components/ui';
import { gerarId, hoje } from '../utils';
import type { Paciente, CategoriaDiagnostico } from '../types';

const CATEGORIAS = [
  { value: 'neurológico', label: 'Neurológico' },
  { value: 'ortopédico', label: 'Ortopédico' },
  { value: 'psiquiátrico', label: 'Psiquiátrico' },
  { value: 'pediátrico', label: 'Pediátrico' },
  { value: 'geriátrico', label: 'Geriátrico' },
  { value: 'oncológico', label: 'Oncológico' },
  { value: 'outro', label: 'Outro' },
];

export default function PacienteForm() {
  const { id } = useParams<{ id?: string }>();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const paciente = id ? state.pacientes.find(p => p.id === id) : undefined;

  const [form, setForm] = useState({
    nome: '', dataNascimento: '', cpf: '', telefone: '', email: '',
    endereco: '', responsavel: '', telefoneResponsavel: '',
    diagnosticoPrincipal: '', categoriaDiagnostico: 'neurológico' as CategoriaDiagnostico,
    cid: '', planoSaude: '', numeroCarteirinha: '', observacoes: '',
  });

  useEffect(() => {
    if (paciente) {
      setForm({
        nome: paciente.nome, dataNascimento: paciente.dataNascimento,
        cpf: paciente.cpf || '', telefone: paciente.telefone || '',
        email: paciente.email || '', endereco: paciente.endereco || '',
        responsavel: paciente.responsavel || '', telefoneResponsavel: paciente.telefoneResponsavel || '',
        diagnosticoPrincipal: paciente.diagnosticoPrincipal,
        categoriaDiagnostico: paciente.categoriaDiagnostico,
        cid: paciente.cid || '', planoSaude: paciente.planoSaude || '',
        numeroCarteirinha: paciente.numeroCarteirinha || '', observacoes: paciente.observacoes || '',
      });
    }
  }, [paciente]);

  const set = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.dataNascimento || !form.diagnosticoPrincipal) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    const payload: Paciente = {
      id: paciente?.id || gerarId(),
      ...form,
      ativo: paciente?.ativo ?? true,
      dataCadastro: paciente?.dataCadastro || hoje(),
    };
    dispatch({ type: isEditing ? 'UPDATE_PACIENTE' : 'ADD_PACIENTE', payload });
    navigate(isEditing ? `/pacientes/${payload.id}` : '/pacientes');
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 6, borderRadius: 8, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <PageHeader title={isEditing ? 'Editar Paciente' : 'Novo Paciente'} />
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 20 }}>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Dados Pessoais</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Nome Completo" value={form.nome} onChange={set('nome')} placeholder="Nome do paciente" required />
              </div>
              <Input label="Data de Nascimento" value={form.dataNascimento} onChange={set('dataNascimento')} type="date" required />
              <Input label="CPF" value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" />
              <Input label="Telefone" value={form.telefone} onChange={set('telefone')} placeholder="(00) 00000-0000" />
              <Input label="E-mail" value={form.email} onChange={set('email')} type="email" placeholder="email@exemplo.com" />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Endereço" value={form.endereco} onChange={set('endereco')} placeholder="Rua, número, bairro, cidade" />
              </div>
              <Input label="Responsável" value={form.responsavel} onChange={set('responsavel')} placeholder="Nome do responsável" />
              <Input label="Telefone do Responsável" value={form.telefoneResponsavel} onChange={set('telefoneResponsavel')} placeholder="(00) 00000-0000" />
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Dados Clínicos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Diagnóstico Principal" value={form.diagnosticoPrincipal} onChange={set('diagnosticoPrincipal')} placeholder="Ex: AVC Isquêmico com hemiplegia direita" required />
              </div>
              <Select label="Categoria" value={form.categoriaDiagnostico} onChange={set('categoriaDiagnostico')} options={CATEGORIAS} />
              <Input label="CID-10" value={form.cid} onChange={set('cid')} placeholder="Ex: I63.9" />
              <Input label="Plano de Saúde" value={form.planoSaude} onChange={set('planoSaude')} placeholder="Nome do plano" />
              <Input label="Nº Carteirinha" value={form.numeroCarteirinha} onChange={set('numeroCarteirinha')} placeholder="Número da carteirinha" />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Observações" value={form.observacoes} onChange={set('observacoes')} as="textarea" rows={3} placeholder="Observações clínicas relevantes..." />
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => navigate(-1)} type="button">Cancelar</Button>
            <Button type="submit"><Save size={14} /> {isEditing ? 'Salvar Alterações' : 'Cadastrar Paciente'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
