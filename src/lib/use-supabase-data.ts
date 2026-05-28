/**
 * Hook central de dados — busca e mutações via Supabase
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

// ── Pacientes ──────────────────────────────────────────────────────────────
export function usePacientes() {
  const { usuario } = useAuth();
  const [pacientes, setPacientes] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clinicaId = usuario?.clinica_id;

  const fetch = useCallback(async () => {
    if (!clinicaId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('nome');
    if (error) setError(error.message);
    else setPacientes(data ?? []);
    setLoading(false);
  }, [clinicaId]);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (dados: Row) => {
    const { data, error } = await (supabase.from('pacientes') as any).insert(dados).select().single();
    if (!error) setPacientes(p => [...p, data].sort((a, b) => a.nome.localeCompare(b.nome)));
    return { data, error };
  };

  const atualizar = async (id: string, dados: Row) => {
    const { data, error } = await (supabase.from('pacientes') as any).update(dados).eq('id', id).select().single();
    if (!error) setPacientes(p => p.map(x => x.id === id ? data : x));
    return { data, error };
  };

  const inativar = async (id: string) => atualizar(id, { ativo: false });
  const reativar = async (id: string) => atualizar(id, { ativo: true });

  return { pacientes, loading, error, refetch: fetch, criar, atualizar, inativar, reativar };
}

// ── Atendimentos ───────────────────────────────────────────────────────────
export function useAtendimentos() {
  const { usuario, perfil } = useAuth();
  const [atendimentos, setAtendimentos] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = usuario?.clinica_id;

  const fetch = useCallback(async () => {
    if (!clinicaId) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('atendimentos')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('data', { ascending: false })
      .order('horario_inicio', { ascending: true });

    if (perfil === 'terapeuta' && usuario?.id) {
      query = query.eq('terapeuta_id', usuario.id);
    }

    const { data, error } = await query;
    if (!error) setAtendimentos(data ?? []);
    setLoading(false);
  }, [clinicaId, perfil, usuario?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (dados: Row) => {
    const { data, error } = await (supabase.from('atendimentos') as any).insert(dados).select().single();
    if (!error) setAtendimentos(a => [data, ...a]);
    return { data, error };
  };

  const atualizar = async (id: string, dados: Row) => {
    const { data, error } = await (supabase.from('atendimentos') as any).update(dados).eq('id', id).select().single();
    if (!error) setAtendimentos(a => a.map(x => x.id === id ? data : x));
    return { data, error };
  };

  return { atendimentos, loading, refetch: fetch, criar, atualizar };
}

// ── Evoluções ──────────────────────────────────────────────────────────────
export function useEvolucoes(pacienteId?: string) {
  const { usuario } = useAuth();
  const [evolucoes, setEvolucoes] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = usuario?.clinica_id;

  const fetch = useCallback(async () => {
    if (!clinicaId) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('evolucoes')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('data', { ascending: false });
    if (pacienteId) query = query.eq('paciente_id', pacienteId);
    const { data, error } = await query;
    if (!error) setEvolucoes(data ?? []);
    setLoading(false);
  }, [clinicaId, pacienteId]);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (dados: Row) => {
    const { data, error } = await (supabase.from('evolucoes') as any).insert(dados).select().single();
    if (!error) setEvolucoes(e => [data, ...e]);
    return { data, error };
  };

  return { evolucoes, loading, refetch: fetch, criar };
}

// ── Avaliações ─────────────────────────────────────────────────────────────
export function useAvaliacoes(pacienteId?: string) {
  const { usuario } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = usuario?.clinica_id;

  const fetch = useCallback(async () => {
    if (!clinicaId) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('avaliacoes')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('data', { ascending: false });
    if (pacienteId) query = query.eq('paciente_id', pacienteId);
    const { data, error } = await query;
    if (!error) setAvaliacoes(data ?? []);
    setLoading(false);
  }, [clinicaId, pacienteId]);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (dados: Row) => {
    const { data, error } = await (supabase.from('avaliacoes') as any).insert(dados).select().single();
    if (!error) setAvaliacoes(a => [data, ...a]);
    return { data, error };
  };

  return { avaliacoes, loading, refetch: fetch, criar };
}

// ── Cobranças ──────────────────────────────────────────────────────────────
export function useCobrancas() {
  const { usuario, perfil } = useAuth();
  const [cobrancas, setCobrancas] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const clinicaId = usuario?.clinica_id;

  const fetch = useCallback(async () => {
    if (!clinicaId) { setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('cobrancas')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('data', { ascending: false });

    if (perfil === 'terapeuta' && usuario?.id) {
      query = query.eq('terapeuta_id', usuario.id);
    }

    const { data, error } = await query;
    if (!error) setCobrancas(data ?? []);
    setLoading(false);
  }, [clinicaId, perfil, usuario?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (dados: Row) => {
    const { data, error } = await (supabase.from('cobrancas') as any).insert(dados).select().single();
    if (!error) setCobrancas(c => [data, ...c]);
    return { data, error };
  };

  const atualizar = async (id: string, dados: Row) => {
    const { data, error } = await (supabase.from('cobrancas') as any).update(dados).eq('id', id).select().single();
    if (!error) setCobrancas(c => c.map(x => x.id === id ? data : x));
    return { data, error };
  };

  const marcarPago = async (id: string, forma: string, dataPagamento: string) => {
    return atualizar(id, {
      status: 'pago',
      forma_pagamento: forma,
      data_pagamento: dataPagamento,
    });
  };

  return { cobrancas, loading, refetch: fetch, criar, atualizar, marcarPago };
}
