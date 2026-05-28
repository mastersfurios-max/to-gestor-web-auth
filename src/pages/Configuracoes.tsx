import { useState } from 'react';
import { Save, Palette, User } from 'lucide-react';
import { useApp } from '../context';
import { Card, Button, Input, PageHeader } from '../components/ui';

const PALETAS = [
  { nome: 'Oceano', cor: '#0a7ea4' },
  { nome: 'Floresta', cor: '#16a34a' },
  { nome: 'Violeta', cor: '#7c3aed' },
  { nome: 'Rosa', cor: '#db2777' },
  { nome: 'Âmbar', cor: '#d97706' },
  { nome: 'Ardósia', cor: '#475569' },
];

export default function Configuracoes() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<'perfil' | 'visual'>('perfil');

  const [perfil, setPerfil] = useState({
    nome: state.terapeuta.nome,
    registro: state.terapeuta.registro,
    especialidade: state.terapeuta.especialidade || '',
    email: state.terapeuta.email || '',
    telefone: state.terapeuta.telefone || '',
    valorPadraoPorSessao: String(state.terapeuta.valorPadraoPorSessao),
  });

  const setP = (key: string) => (v: string) => setPerfil(f => ({ ...f, [key]: v }));

  function salvarPerfil() {
    dispatch({
      type: 'UPDATE_TERAPEUTA',
      payload: {
        ...state.terapeuta,
        ...perfil,
        valorPadraoPorSessao: Number(perfil.valorPadraoPorSessao) || 0,
      },
    });
    alert('✓ Perfil atualizado com sucesso!');
  }

  return (
    <div style={{ padding: 24, maxWidth: 800 }}>
      <PageHeader title="Configurações" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid var(--color-border)', marginBottom: 24 }}>
        {[
          { key: 'perfil', label: 'Perfil do Terapeuta', icon: <User size={15} /> },
          { key: 'visual', label: 'Personalização Visual', icon: <Palette size={15} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'perfil' | 'visual')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: 'transparent',
              borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              marginBottom: -2,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {tab === 'perfil' && (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Nome Completo" value={perfil.nome} onChange={setP('nome')} placeholder="Seu nome completo" />
            </div>
            <Input label="Registro (CREFITO)" value={perfil.registro} onChange={setP('registro')} placeholder="CREFITO-3/00000-TO" />
            <Input label="Especialidade" value={perfil.especialidade} onChange={setP('especialidade')} placeholder="Ex: Terapia Ocupacional" />
            <Input label="E-mail" value={perfil.email} onChange={setP('email')} type="email" placeholder="seu@email.com" />
            <Input label="Telefone" value={perfil.telefone} onChange={setP('telefone')} placeholder="(00) 00000-0000" />
            <Input label="Valor Padrão por Sessão (R$)" value={perfil.valorPadraoPorSessao} onChange={setP('valorPadraoPorSessao')} type="number" placeholder="120" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <Button onClick={salvarPerfil}><Save size={14} /> Salvar Perfil</Button>
          </div>
        </Card>
      )}

      {/* Visual */}
      {tab === 'visual' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Modo claro/escuro */}
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Modo de Exibição</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { value: 'light', label: '☀️ Modo Claro' },
                { value: 'dark', label: '🌙 Modo Escuro' },
              ].map(m => (
                <button
                  key={m.value}
                  onClick={() => dispatch({ type: 'SET_TEMA', payload: m.value as 'light' | 'dark' })}
                  style={{
                    flex: 1, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                    border: state.tema === m.value ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    background: state.tema === m.value ? 'var(--color-primary)10' : 'var(--color-surface2)',
                    color: state.tema === m.value ? 'var(--color-primary)' : 'var(--color-text)',
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Paleta de cores */}
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Cor Principal</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {PALETAS.map(p => {
                const ativo = state.corPrimaria === p.cor;
                return (
                  <button
                    key={p.cor}
                    onClick={() => dispatch({ type: 'SET_COR_PRIMARIA', payload: p.cor })}
                    style={{
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      border: ativo ? `2px solid ${p.cor}` : '2px solid var(--color-border)',
                      background: ativo ? `${p.cor}15` : 'var(--color-surface2)',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 12, background: p.cor, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: ativo ? p.cor : 'var(--color-text)' }}>{p.nome}</span>
                    {ativo && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Cor personalizada */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>Cor personalizada:</label>
              <input
                type="color"
                value={state.corPrimaria}
                onChange={e => dispatch({ type: 'SET_COR_PRIMARIA', payload: e.target.value })}
                style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', cursor: 'pointer', padding: 2 }}
              />
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{state.corPrimaria}</span>
            </div>
          </Card>

          {/* Preview */}
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>Pré-visualização</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--color-primary)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'default' }}>
                Botão Primário
              </button>
              <div style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--color-primary)20', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700 }}>
                Badge
              </div>
              <div style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontSize: 14, fontWeight: 600 }}>
                Outline
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
