import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { Paciente, Atendimento, Evolucao, Avaliacao, Cobranca, Terapeuta, SugestaoAtividade } from './types';
import { mockPacientes, mockAtendimentos, mockEvolucoes, mockAvaliacoes, mockCobrancas, mockTerapeuta, mockSugestoes } from './mock-data';

// ── State ──────────────────────────────────────────────────────────────────
export interface AppState {
  pacientes: Paciente[];
  atendimentos: Atendimento[];
  evolucoes: Evolucao[];
  avaliacoes: Avaliacao[];
  cobrancas: Cobranca[];
  terapeuta: Terapeuta;
  sugestoes: SugestaoAtividade[];
  tema: 'light' | 'dark';
  corPrimaria: string;
}

const initialState: AppState = {
  pacientes: mockPacientes,
  atendimentos: mockAtendimentos,
  evolucoes: mockEvolucoes,
  avaliacoes: mockAvaliacoes,
  cobrancas: mockCobrancas,
  terapeuta: mockTerapeuta,
  sugestoes: mockSugestoes,
  tema: 'light',
  corPrimaria: '#0a7ea4',
};

// ── Actions ────────────────────────────────────────────────────────────────
type Action =
  | { type: 'ADD_PACIENTE'; payload: Paciente }
  | { type: 'UPDATE_PACIENTE'; payload: Paciente }
  | { type: 'DELETE_PACIENTE'; payload: string }
  | { type: 'ADD_ATENDIMENTO'; payload: Atendimento }
  | { type: 'UPDATE_ATENDIMENTO'; payload: Atendimento }
  | { type: 'DELETE_ATENDIMENTO'; payload: string }
  | { type: 'ADD_EVOLUCAO'; payload: Evolucao }
  | { type: 'ADD_AVALIACAO'; payload: Avaliacao }
  | { type: 'ADD_COBRANCA'; payload: Cobranca }
  | { type: 'UPDATE_COBRANCA'; payload: Cobranca }
  | { type: 'UPDATE_TERAPEUTA'; payload: Terapeuta }
  | { type: 'TOGGLE_FAVORITA'; payload: string }
  | { type: 'SET_TEMA'; payload: 'light' | 'dark' }
  | { type: 'SET_COR_PRIMARIA'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': return action.payload;
    case 'ADD_PACIENTE': return { ...state, pacientes: [...state.pacientes, action.payload] };
    case 'UPDATE_PACIENTE': return { ...state, pacientes: state.pacientes.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PACIENTE': return { ...state, pacientes: state.pacientes.map(p => p.id === action.payload ? { ...p, ativo: false } : p) };
    case 'ADD_ATENDIMENTO': return { ...state, atendimentos: [...state.atendimentos, action.payload] };
    case 'UPDATE_ATENDIMENTO': return { ...state, atendimentos: state.atendimentos.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_ATENDIMENTO': return { ...state, atendimentos: state.atendimentos.filter(a => a.id !== action.payload) };
    case 'ADD_EVOLUCAO': return { ...state, evolucoes: [...state.evolucoes, action.payload] };
    case 'ADD_AVALIACAO': return { ...state, avaliacoes: [...state.avaliacoes, action.payload] };
    case 'ADD_COBRANCA': return { ...state, cobrancas: [...state.cobrancas, action.payload] };
    case 'UPDATE_COBRANCA': return { ...state, cobrancas: state.cobrancas.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'UPDATE_TERAPEUTA': return { ...state, terapeuta: action.payload };
    case 'TOGGLE_FAVORITA': return { ...state, sugestoes: state.sugestoes.map(s => s.id === action.payload ? { ...s, favorita: !s.favorita } : s) };
    case 'SET_TEMA': return { ...state, tema: action.payload };
    case 'SET_COR_PRIMARIA': return { ...state, corPrimaria: action.payload };
    default: return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('to-gestor-state');
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed } });
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('to-gestor-state', JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, loaded]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.tema);
  }, [state.tema]);

  // Apply primary color
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', state.corPrimaria);
    const hover = state.corPrimaria + 'cc';
    document.documentElement.style.setProperty('--color-primary-hover', hover);
  }, [state.corPrimaria]);

  if (!loaded) return null;

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
