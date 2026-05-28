// ============================================================
// Tipos e Interfaces — TO Gestor Web
// ============================================================

export type StatusAtendimento = 'confirmado' | 'pendente' | 'cancelado' | 'realizado';
export type StatusPagamento = 'pago' | 'pendente' | 'vencido' | 'isento';
export type TipoAtendimento =
  | 'individual' | 'grupo' | 'domiciliar' | 'hospitalar' | 'escolar' | 'teleAtendimento';

export type CategoriaDiagnostico =
  | 'neurológico' | 'ortopédico' | 'psiquiátrico' | 'pediátrico'
  | 'geriátrico' | 'oncológico' | 'outro';

export type FormaPagamento =
  | 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'plano_saude';

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  responsavel?: string;
  telefoneResponsavel?: string;
  diagnosticoPrincipal: string;
  categoriaDiagnostico: CategoriaDiagnostico;
  cid?: string;
  planoSaude?: string;
  numeroCarteirinha?: string;
  observacoes?: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface Atendimento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  tipo: TipoAtendimento;
  status: StatusAtendimento;
  local?: string;
  observacoes?: string;
  valorSessao: number;
  cobrado: boolean;
  evolucaoId?: string;
  createdAt: string;
}

export interface Evolucao {
  id: string;
  atendimentoId?: string;
  pacienteId: string;
  data: string;
  queixaPrincipal?: string;
  objetivosSessao: string;
  atividadesRealizadas: string;
  respostaPaciente: string;
  observacoesClinicas?: string;
  observacoes?: string;
  planejamentoProximaSessao?: string;
  createdAt: string;
}

export interface Avaliacao {
  id: string;
  pacienteId: string;
  tipo: string;
  data: string;
  resultado: string;
  pontuacao?: number;
  observacoes?: string;
  createdAt: string;
}

export interface Cobranca {
  id: string;
  atendimentoId: string;
  pacienteId: string;
  pacienteNome: string;
  data: string;
  valor: number;
  status: StatusPagamento;
  formaPagamento?: FormaPagamento;
  dataPagamento?: string;
  observacoes?: string;
  createdAt: string;
}

export interface Terapeuta {
  nome: string;
  registro: string;
  especialidade?: string;
  telefone?: string;
  email?: string;
  valorPadraoPorSessao: number;
  duracaoPadraoPorSessao: number;
}

export type CategoriaAtividade =
  | 'AVDs' | 'AIVDs' | 'cognição' | 'motricidade_fina' | 'motricidade_grossa'
  | 'socialização' | 'sensorial' | 'lúdico' | 'vocacional' | 'lazer';

export interface SugestaoAtividade {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaAtividade;
  diagnosticosIndicados: CategoriaDiagnostico[];
  tiposAtendimento: TipoAtendimento[];
  materiais?: string[];
  duracaoEstimada?: number;
  nivelDificuldade: 'fácil' | 'médio' | 'difícil';
  objetivos: string[];
  favorita?: boolean;
}
