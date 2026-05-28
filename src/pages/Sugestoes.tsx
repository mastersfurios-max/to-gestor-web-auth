import { useState, useMemo } from 'react';
import { Heart, Search, Lightbulb } from 'lucide-react';
import { useApp } from '../context';
import { Card, PageHeader, Badge, EmptyState } from '../components/ui';

const CATEGORIAS = ['Todas', 'AVDs', 'Cognição', 'Motricidade Fina', 'Motricidade Grossa', 'Sensorial', 'Social', 'Escolar', 'Lazer'];

const CAT_COLORS: Record<string, string> = {
  'AVDs': '#0a7ea4', 'Cognição': '#6366F1', 'Motricidade Fina': '#F59E0B',
  'Motricidade Grossa': '#27AE60', 'Sensorial': '#EC4899', 'Social': '#8B5CF6',
  'Escolar': '#3B82F6', 'Lazer': '#EF4444',
};

export default function Sugestoes() {
  const { state, dispatch } = useApp();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [apenasF, setApenasF] = useState(false);

  const sugestoesFiltradas = useMemo(() => {
    return state.sugestoes.filter(s => {
      if (categoria !== 'Todas' && s.categoria !== categoria) return false;
      if (apenasF && !s.favorita) return false;
      if (busca && !s.titulo.toLowerCase().includes(busca.toLowerCase()) && !s.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [state.sugestoes, categoria, apenasF, busca]);

  const totalFavoritas = state.sugestoes.filter(s => s.favorita).length;

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader
        title="Sugestões de Atividades"
        subtitle={`${state.sugestoes.length} atividades · ${totalFavoritas} favoritas`}
      />

      {/* Busca e filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar atividade..."
            style={{
              width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8,
              border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={() => setApenasF(!apenasF)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: apenasF ? '#EF444415' : 'var(--color-surface)',
            color: apenasF ? '#EF4444' : 'var(--color-text-muted)',
          }}
        >
          <Heart size={14} fill={apenasF ? '#EF4444' : 'none'} /> Favoritas ({totalFavoritas})
        </button>
      </div>

      {/* Categorias */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIAS.map(cat => {
          const cor = cat === 'Todas' ? 'var(--color-primary)' : (CAT_COLORS[cat] || '#6B7280');
          const ativo = categoria === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: ativo ? cor : `${cor}15`,
                color: ativo ? '#fff' : cor,
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid de sugestões */}
      {sugestoesFiltradas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb />}
          title="Nenhuma atividade encontrada"
          description="Tente outro filtro ou termo de busca."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {sugestoesFiltradas.map(s => {
            const cor = CAT_COLORS[s.categoria] || '#6B7280';
            return (
              <Card key={s.id} style={{ padding: '16px 18px', position: 'relative' }}>
                {/* Favorito */}
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_FAVORITA', payload: s.id })}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: s.favorita ? '#EF4444' : 'var(--color-text-muted)',
                  }}
                  title={s.favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart size={18} fill={s.favorita ? '#EF4444' : 'none'} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: 10, paddingRight: 28 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{s.titulo}</div>
                  <Badge label={s.categoria} color={cor} />
                </div>

                {/* Descrição */}
                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{s.descricao}</p>

                {/* Materiais */}
                {s.materiais && s.materiais.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Materiais</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {s.materiais.map(m => (
                        <span key={m} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--color-surface2)', color: 'var(--color-text-muted)' }}>{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicações */}
                {s.diagnosticosIndicados && s.diagnosticosIndicados.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Indicado para</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {s.diagnosticosIndicados.map((ind: string) => (
                        <span key={ind} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: `${cor}15`, color: cor, fontWeight: 600 }}>{ind}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duração */}
                {s.duracaoEstimada && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    ⏱ {s.duracaoEstimada} minutos
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
