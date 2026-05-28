// Tipos gerados do schema Supabase — TO Gestor
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PerfilUsuario = 'admin' | 'terapeuta' | 'secretaria';
export type StatusAtendimentoDB = 'confirmado' | 'pendente' | 'cancelado' | 'realizado';
export type StatusPagamentoDB = 'pago' | 'pendente' | 'vencido' | 'isento';
export type TipoAtendimentoDB = 'individual' | 'grupo' | 'domiciliar' | 'hospitalar' | 'escolar' | 'teleAtendimento';
export type CategoriaDiagnosticoDB = 'neurológico' | 'ortopédico' | 'psiquiátrico' | 'pediátrico' | 'geriátrico' | 'oncológico' | 'outro';
export type FormaPagamentoDB = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'plano_saude';

export interface Database {
  public: {
    Tables: {
      clinicas: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          telefone: string | null;
          email: string | null;
          endereco: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clinicas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clinicas']['Insert']>;
      };
      usuarios: {
        Row: {
          id: string;
          clinica_id: string | null;
          nome: string;
          email: string;
          perfil: PerfilUsuario;
          registro_profissional: string | null;
          especialidade: string | null;
          telefone: string | null;
          valor_padrao_sessao: number;
          duracao_padrao_sessao: number;
          ativo: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      pacientes: {
        Row: {
          id: string;
          clinica_id: string;
          terapeuta_id: string | null;
          nome: string;
          data_nascimento: string | null;
          cpf: string | null;
          telefone: string | null;
          email: string | null;
          endereco: string | null;
          responsavel: string | null;
          telefone_responsavel: string | null;
          diagnostico_principal: string;
          categoria_diagnostico: CategoriaDiagnosticoDB;
          cid: string | null;
          plano_saude: string | null;
          numero_carteirinha: string | null;
          observacoes: string | null;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pacientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pacientes']['Insert']>;
      };
      atendimentos: {
        Row: {
          id: string;
          clinica_id: string;
          paciente_id: string;
          terapeuta_id: string;
          data: string;
          horario_inicio: string;
          horario_fim: string;
          tipo: TipoAtendimentoDB;
          status: StatusAtendimentoDB;
          local: string | null;
          observacoes: string | null;
          valor_sessao: number;
          cobrado: boolean;
          evolucao_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['atendimentos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['atendimentos']['Insert']>;
      };
      evolucoes: {
        Row: {
          id: string;
          clinica_id: string;
          paciente_id: string;
          terapeuta_id: string;
          atendimento_id: string | null;
          data: string;
          queixa_principal: string | null;
          objetivos_sessao: string;
          atividades_realizadas: string;
          resposta_paciente: string;
          observacoes_clinicas: string | null;
          planejamento_proxima_sessao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evolucoes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['evolucoes']['Insert']>;
      };
      avaliacoes: {
        Row: {
          id: string;
          clinica_id: string;
          paciente_id: string;
          terapeuta_id: string;
          tipo: string;
          data: string;
          resultado: string;
          pontuacao: number | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['avaliacoes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['avaliacoes']['Insert']>;
      };
      cobrancas: {
        Row: {
          id: string;
          clinica_id: string;
          atendimento_id: string;
          paciente_id: string;
          terapeuta_id: string;
          data: string;
          valor: number;
          status: StatusPagamentoDB;
          forma_pagamento: FormaPagamentoDB | null;
          data_pagamento: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cobrancas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cobrancas']['Insert']>;
      };
      sugestoes_atividades: {
        Row: {
          id: string;
          clinica_id: string | null;
          titulo: string;
          descricao: string;
          categoria: string;
          diagnosticos_indicados: string[];
          tipos_atendimento: string[];
          materiais: string[];
          duracao_estimada: number | null;
          nivel_dificuldade: string;
          objetivos: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sugestoes_atividades']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sugestoes_atividades']['Insert']>;
      };
      sugestoes_favoritas: {
        Row: { usuario_id: string; sugestao_id: string };
        Insert: Database['public']['Tables']['sugestoes_favoritas']['Row'];
        Update: Partial<Database['public']['Tables']['sugestoes_favoritas']['Row']>;
      };
    };
    Functions: {
      get_user_clinica_id: { Args: Record<never, never>; Returns: string };
      get_user_perfil: { Args: Record<never, never>; Returns: string };
    };
  };
}
