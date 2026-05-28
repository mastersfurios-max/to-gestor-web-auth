import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Plus, Edit2, Eye, EyeOff,
  Building2, Save, UserCheck, UserX, Mail, Phone, Key
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Card, Button, PageHeader, Input, Select } from '../components/ui';

type UsuarioRow = Database['public']['Tables']['usuarios']['Row'];
type ClinicaRow = Database['public']['Tables']['clinicas']['Row'];

const PERFIL_COLORS: Record<string, string> = {
  admin: '#7c3aed',
  terapeuta: '#0d9488',
  secretaria: '#d97706',
};

// ── Formulário de novo usuário ─────────────────────────────────────────────
interface NovoUsuarioForm {
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin' | 'terapeuta' | 'secretaria';
  registro_profissional: string;
  especialidade: string;
  telefone: string;
}

function ModalNovoUsuario({
  clinicaId,
  onClose,
  onSuccess,
}: {
  clinicaId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<NovoUsuarioForm>({
    nome: '', email: '', senha: '', perfil: 'terapeuta',
    registro_profissional: '', especialidade: '', telefone: '',
  });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const set = (k: keyof NovoUsuarioForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) {
      setErro('Nome, e-mail e senha são obrigatórios.');
      return;
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setErro('');
    setLoading(true);

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: form.email.trim().toLowerCase(),
      password: form.senha,
      email_confirm: true,
      user_metadata: { nome: form.nome, perfil: form.perfil },
    });

    if (authError || !authData.user) {
      setErro(authError?.message ?? 'Erro ao criar usuário.');
      setLoading(false);
      return;
    }

    // Atualiza o perfil com clinica_id e dados extras
    const { error: updateError } = await (supabase.from('usuarios') as any)
      .update({
        clinica_id: clinicaId,
        nome: form.nome,
        perfil: form.perfil,
        registro_profissional: form.registro_profissional || null,
        especialidade: form.especialidade || null,
        telefone: form.telefone || null,
      })
      .eq('id', authData.user.id);

    if (updateError) {
      setErro('Usuário criado, mas erro ao associar à clínica: ' + updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: 16, padding: 24,
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>Novo Usuário</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 20 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nome completo *" value={form.nome} onChange={set('nome')} placeholder="Dra. Ana Paula Silva" />
          <Input label="E-mail *" value={form.email} onChange={set('email')} placeholder="ana@clinica.com" type="email" />

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>
              Senha *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={form.senha}
                onChange={e => set('senha')(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%', padding: '9px 40px 9px 12px', borderRadius: 8,
                  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                  color: 'var(--color-text)', fontSize: 14, boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Select
            label="Perfil de acesso *"
            value={form.perfil}
            onChange={v => set('perfil')(v)}
            options={[
              { value: 'admin', label: 'Administrador' },
              { value: 'terapeuta', label: 'Terapeuta / Profissional' },
              { value: 'secretaria', label: 'Secretária / Recepcionista' },
            ]}
          />

          {(form.perfil === 'terapeuta' || form.perfil === 'admin') && (
            <>
              <Input label="Registro profissional (CREFITO, CRP...)" value={form.registro_profissional} onChange={set('registro_profissional')} placeholder="CREFITO-3 / 123456-TO" />
              <Input label="Especialidade" value={form.especialidade} onChange={set('especialidade')} placeholder="Terapia Ocupacional" />
            </>
          )}

          <Input label="Telefone" value={form.telefone} onChange={set('telefone')} placeholder="(11) 99999-9999" />

          {erro && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit" loading={loading} icon={<Plus size={16} />}>Criar Usuário</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function Admin() {
  const { usuario, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [clinica, setClinica] = useState<ClinicaRow | null>(null); // eslint-disable-line
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'usuarios' | 'clinica'>('usuarios');
  const [showModalNovo, setShowModalNovo] = useState(false);
  const [editandoClinica, setEditandoClinica] = useState(false);
  const [clinicaForm, setClinicaForm] = useState({ nome: '', cnpj: '', telefone: '', email: '', endereco: '' });
  const [savingClinica, setSavingClinica] = useState(false);

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const clinicaId = usuario?.clinica_id;

  const carregarDados = async () => {
    if (!clinicaId) return;
    setLoading(true);

    const [{ data: usrs }, { data: clin }] = await Promise.all([
      (supabase.from('usuarios') as any).select('*').eq('clinica_id', clinicaId).order('nome'),
      (supabase.from('clinicas') as any).select('*').eq('id', clinicaId).single(),
    ]);

    setUsuarios(usrs ?? []);
    setClinica(clin as ClinicaRow | null);
    if (clin) {
      setClinicaForm({
        nome: clin.nome ?? '',
        cnpj: clin.cnpj ?? '',
        telefone: clin.telefone ?? '',
        email: clin.email ?? '',
        endereco: clin.endereco ?? '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { carregarDados(); }, [clinicaId]);

  const toggleAtivo = async (usr: UsuarioRow) => {
    if (usr.id === usuario?.id) {
      alert('Você não pode desativar sua própria conta.');
      return;
    }
    await (supabase.from('usuarios') as any).update({ ativo: !usr.ativo }).eq('id', usr.id);
    carregarDados();
  };

  const alterarPerfil = async (usr: UsuarioRow, novoPerfil: string) => {
    if (usr.id === usuario?.id) {
      alert('Você não pode alterar o próprio perfil.');
      return;
    }
    await (supabase.from('usuarios') as any).update({ perfil: novoPerfil }).eq('id', usr.id);
    carregarDados();
  };

  const salvarClinica = async () => {
    if (!clinicaId) return;
    setSavingClinica(true);
    await (supabase.from('clinicas') as any).update({
      nome: clinicaForm.nome,
      cnpj: clinicaForm.cnpj || null,
      telefone: clinicaForm.telefone || null,
      email: clinicaForm.email || null,
      endereco: clinicaForm.endereco || null,
    }).eq('id', clinicaId);
    setSavingClinica(false);
    setEditandoClinica(false);
    carregarDados();
  };

  const resetarSenha = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert('Erro ao enviar e-mail: ' + error.message);
    else alert(`E-mail de redefinição de senha enviado para ${email}`);
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <PageHeader
        title="Administração"
        subtitle="Gerencie usuários e configurações da clínica"
        icon={<ShieldCheck size={24} />}
      />

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {[
          { id: 'usuarios', label: 'Usuários', icon: <Users size={16} /> },
          { id: 'clinica', label: 'Clínica', icon: <Building2 size={16} /> },
        ].map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id as 'usuarios' | 'clinica')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: abaAtiva === aba.id ? 600 : 400,
              color: abaAtiva === aba.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: abaAtiva === aba.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {aba.icon} {aba.label}
          </button>
        ))}
      </div>

      {/* ── ABA USUÁRIOS ── */}
      {abaAtiva === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
            </p>
            <Button icon={<Plus size={16} />} onClick={() => setShowModalNovo(true)}>
              Novo Usuário
            </Button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Carregando...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {usuarios.map(usr => (
                <Card key={usr.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 22,
                      background: PERFIL_COLORS[usr.perfil] + '20',
                      border: `2px solid ${PERFIL_COLORS[usr.perfil]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: PERFIL_COLORS[usr.perfil], flexShrink: 0,
                    }}>
                      {usr.nome.charAt(0)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 15 }}>{usr.nome}</span>
                        {!usr.ativo && (
                          <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                            Inativo
                          </span>
                        )}
                        {usr.id === usuario?.id && (
                          <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 11, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                            Você
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={12} /> {usr.email}
                        </span>
                        {usr.telefone && (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={12} /> {usr.telefone}
                          </span>
                        )}
                        {usr.registro_profissional && (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            {usr.registro_profissional}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Perfil select */}
                    <select
                      value={usr.perfil}
                      onChange={e => alterarPerfil(usr, e.target.value)}
                      disabled={usr.id === usuario?.id}
                      style={{
                        padding: '5px 10px', borderRadius: 20, border: `1px solid ${PERFIL_COLORS[usr.perfil]}`,
                        background: PERFIL_COLORS[usr.perfil] + '15', color: PERFIL_COLORS[usr.perfil],
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <option value="admin">Administrador</option>
                      <option value="terapeuta">Terapeuta</option>
                      <option value="secretaria">Secretária</option>
                    </select>

                    {/* Ações */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => resetarSenha(usr.email)}
                        title="Enviar redefinição de senha"
                        style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                      >
                        <Key size={15} />
                      </button>
                      <button
                        onClick={() => toggleAtivo(usr)}
                        title={usr.ativo ? 'Desativar usuário' : 'Reativar usuário'}
                        style={{
                          padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: usr.ativo ? '#fef2f2' : '#f0fdf4',
                          color: usr.ativo ? '#dc2626' : '#16a34a',
                        }}
                      >
                        {usr.ativo ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ABA CLÍNICA ── */}
      {abaAtiva === 'clinica' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 16 }}>Dados da Clínica</h3>
            {!editandoClinica ? (
              <Button variant="outline" icon={<Edit2 size={15} />} onClick={() => setEditandoClinica(true)}>
                Editar
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="outline" onClick={() => setEditandoClinica(false)}>Cancelar</Button>
                <Button icon={<Save size={15} />} loading={savingClinica} onClick={salvarClinica}>Salvar</Button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <Input
              label="Nome da Clínica *"
              value={clinicaForm.nome}
              onChange={v => setClinicaForm(f => ({ ...f, nome: v }))}
              disabled={!editandoClinica}
            />
            <Input
              label="CNPJ"
              value={clinicaForm.cnpj}
              onChange={v => setClinicaForm(f => ({ ...f, cnpj: v }))}
              placeholder="00.000.000/0000-00"
              disabled={!editandoClinica}
            />
            <Input
              label="Telefone"
              value={clinicaForm.telefone}
              onChange={v => setClinicaForm(f => ({ ...f, telefone: v }))}
              placeholder="(11) 3000-0000"
              disabled={!editandoClinica}
            />
            <Input
              label="E-mail"
              value={clinicaForm.email}
              onChange={v => setClinicaForm(f => ({ ...f, email: v }))}
              placeholder="contato@clinica.com"
              disabled={!editandoClinica}
            />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Endereço"
                value={clinicaForm.endereco}
                onChange={v => setClinicaForm(f => ({ ...f, endereco: v }))}
                placeholder="Rua, número, bairro, cidade - UF"
                disabled={!editandoClinica}
              />
            </div>
          </div>

          {clinica && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                ID da clínica: <code style={{ background: 'var(--color-bg)', padding: '1px 6px', borderRadius: 4 }}>{clinica.id}</code>
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Criada em: {new Date(clinica.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Modal novo usuário */}
      {showModalNovo && clinicaId && (
        <ModalNovoUsuario
          clinicaId={clinicaId}
          onClose={() => setShowModalNovo(false)}
          onSuccess={carregarDados}
        />
      )}
    </div>
  );
}
