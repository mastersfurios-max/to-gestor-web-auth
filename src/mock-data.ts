import type { Paciente, Atendimento, Evolucao, Avaliacao, Cobranca, Terapeuta, SugestaoAtividade } from './types';

export const mockTerapeuta: Terapeuta = {
  nome: 'Dra. Ana Paula Silva',
  registro: 'CREFITO-3 / 123456-TO',
  especialidade: 'Neurologia e Reabilitação',
  telefone: '(11) 99999-0000',
  email: 'ana.paula@togestor.com',
  valorPadraoPorSessao: 120,
  duracaoPadraoPorSessao: 50,
};

const hoje = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const diasAtras = (n: number) => { const d = new Date(hoje); d.setDate(d.getDate() - n); return fmt(d); };
const diasFrente = (n: number) => { const d = new Date(hoje); d.setDate(d.getDate() + n); return fmt(d); };

export const mockPacientes: Paciente[] = [
  {
    id: 'p1', nome: 'Carlos Eduardo Mendes', dataNascimento: '1978-03-15',
    cpf: '123.456.789-00', telefone: '(11) 98765-4321', email: 'carlos@email.com',
    diagnosticoPrincipal: 'AVC Isquêmico com hemiplegia direita',
    categoriaDiagnostico: 'neurológico', cid: 'I63.9',
    observacoes: 'Paciente com boa adesão ao tratamento. Família participativa.',
    ativo: true, dataCadastro: diasAtras(120),
  },
  {
    id: 'p2', nome: 'Mariana Lima Costa', dataNascimento: '2015-07-22',
    telefone: '(11) 97654-3210', responsavel: 'Fernanda Lima',
    telefoneResponsavel: '(11) 96543-2109',
    diagnosticoPrincipal: 'Transtorno do Espectro Autista (TEA) nível 2',
    categoriaDiagnostico: 'pediátrico', cid: 'F84.0',
    planoSaude: 'Unimed', numeroCarteirinha: '9876543',
    observacoes: 'Sensibilidade sensorial aumentada. Prefere atividades estruturadas.',
    ativo: true, dataCadastro: diasAtras(90),
  },
  {
    id: 'p3', nome: 'Dona Rosa Ferreira', dataNascimento: '1942-11-08',
    telefone: '(11) 95432-1098', endereco: 'Rua das Flores, 123 - São Paulo',
    diagnosticoPrincipal: 'Doença de Parkinson estágio 3',
    categoriaDiagnostico: 'neurológico', cid: 'G20',
    observacoes: 'Atendimento domiciliar. Cuidador presente nas sessões.',
    ativo: true, dataCadastro: diasAtras(60),
  },
  {
    id: 'p4', nome: 'Roberto Alves Santos', dataNascimento: '1965-05-30',
    cpf: '987.654.321-00', telefone: '(11) 94321-0987',
    diagnosticoPrincipal: 'Lesão medular incompleta C5-C6',
    categoriaDiagnostico: 'ortopédico', cid: 'S14.1',
    planoSaude: 'Bradesco Saúde',
    ativo: true, dataCadastro: diasAtras(45),
  },
  {
    id: 'p5', nome: 'Juliana Pereira Nunes', dataNascimento: '1990-09-14',
    telefone: '(11) 93210-9876', email: 'juliana@email.com',
    diagnosticoPrincipal: 'Transtorno de Ansiedade Generalizada + TDAH',
    categoriaDiagnostico: 'psiquiátrico', cid: 'F41.1',
    ativo: false, dataCadastro: diasAtras(200),
  },
];

export const mockAtendimentos: Atendimento[] = [
  { id: 'a1', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: fmt(hoje), horarioInicio: '08:00', horarioFim: '08:50', tipo: 'individual', status: 'confirmado', local: 'Clínica', valorSessao: 120, cobrado: true, createdAt: diasAtras(3) },
  { id: 'a2', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: fmt(hoje), horarioInicio: '09:00', horarioFim: '09:50', tipo: 'individual', status: 'confirmado', local: 'Clínica', valorSessao: 120, cobrado: true, createdAt: diasAtras(3) },
  { id: 'a3', pacienteId: 'p3', pacienteNome: 'Dona Rosa Ferreira', data: fmt(hoje), horarioInicio: '10:00', horarioFim: '10:50', tipo: 'domiciliar', status: 'pendente', local: 'Domicílio', valorSessao: 150, cobrado: false, createdAt: diasAtras(2) },
  { id: 'a4', pacienteId: 'p4', pacienteNome: 'Roberto Alves Santos', data: diasFrente(1), horarioInicio: '14:00', horarioFim: '14:50', tipo: 'individual', status: 'confirmado', local: 'Clínica', valorSessao: 120, cobrado: false, createdAt: diasAtras(1) },
  { id: 'a5', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: diasAtras(7), horarioInicio: '08:00', horarioFim: '08:50', tipo: 'individual', status: 'realizado', local: 'Clínica', valorSessao: 120, cobrado: true, evolucaoId: 'e1', createdAt: diasAtras(10) },
  { id: 'a6', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: diasAtras(7), horarioInicio: '09:00', horarioFim: '09:50', tipo: 'individual', status: 'realizado', local: 'Clínica', valorSessao: 120, cobrado: true, evolucaoId: 'e2', createdAt: diasAtras(10) },
  { id: 'a7', pacienteId: 'p3', pacienteNome: 'Dona Rosa Ferreira', data: diasAtras(7), horarioInicio: '10:00', horarioFim: '10:50', tipo: 'domiciliar', status: 'realizado', local: 'Domicílio', valorSessao: 150, cobrado: true, createdAt: diasAtras(10) },
  { id: 'a8', pacienteId: 'p4', pacienteNome: 'Roberto Alves Santos', data: diasAtras(14), horarioInicio: '14:00', horarioFim: '14:50', tipo: 'individual', status: 'cancelado', local: 'Clínica', valorSessao: 120, cobrado: false, createdAt: diasAtras(17) },
  { id: 'a9', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: diasFrente(2), horarioInicio: '09:00', horarioFim: '09:50', tipo: 'individual', status: 'pendente', local: 'Clínica', valorSessao: 120, cobrado: false, createdAt: diasAtras(1) },
  { id: 'a10', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: diasAtras(14), horarioInicio: '08:00', horarioFim: '08:50', tipo: 'individual', status: 'realizado', local: 'Clínica', valorSessao: 120, cobrado: true, createdAt: diasAtras(17) },
];

export const mockEvolucoes: Evolucao[] = [
  {
    id: 'e1', atendimentoId: 'a5', pacienteId: 'p1', data: diasAtras(7),
    queixaPrincipal: 'Dificuldade em realizar AVDs com membro superior direito',
    objetivosSessao: 'Treino de alcance e preensão; estimulação proprioceptiva MSD',
    atividadesRealizadas: 'Exercícios de alcance com objetos de diferentes tamanhos; atividades de vida diária simuladas; treino de preensão com massa de modelar',
    respostaPaciente: 'Boa tolerância às atividades. Demonstrou melhora no alcance acima da linha do ombro. Relata menos dor durante os movimentos.',
    planejamentoProximaSessao: 'Introduzir atividades bimanuais; aumentar grau de dificuldade nas AVDs',
    createdAt: diasAtras(7),
  },
  {
    id: 'e2', atendimentoId: 'a6', pacienteId: 'p2', data: diasAtras(7),
    objetivosSessao: 'Estimulação sensorial e integração sensorial; habilidades de comunicação',
    atividadesRealizadas: 'Caixa sensorial com diferentes texturas; atividade de encaixe; jogo de memória com figuras',
    respostaPaciente: 'Tolerou bem as texturas da caixa sensorial. Apresentou dificuldade inicial no encaixe mas concluiu com apoio verbal.',
    planejamentoProximaSessao: 'Introduzir atividade com tinta digital; continuar estimulação sensorial',
    createdAt: diasAtras(7),
  },
];

export const mockAvaliacoes: Avaliacao[] = [
  { id: 'av1', pacienteId: 'p1', tipo: 'Medida de Independência Funcional (MIF)', data: diasAtras(30), resultado: 'Pontuação total 98/126. Maior comprometimento em autocuidado (28/42) e mobilidade (22/35).', pontuacao: 98, createdAt: diasAtras(30) },
  { id: 'av2', pacienteId: 'p1', tipo: 'Escala de Fugl-Meyer', data: diasAtras(30), resultado: 'Membro superior: 42/66. Comprometimento moderado de coordenação e velocidade.', pontuacao: 42, createdAt: diasAtras(30) },
  { id: 'av3', pacienteId: 'p2', tipo: 'Perfil Sensorial (Dunn)', data: diasAtras(45), resultado: 'Alta sensibilidade ao toque e sons. Baixo registro para estímulos visuais. Busca intensa de estímulos proprioceptivos.', createdAt: diasAtras(45) },
  { id: 'av4', pacienteId: 'p3', tipo: 'Índice de Barthel', data: diasAtras(20), resultado: 'Pontuação 65/100. Dependência moderada. Necessita assistência em banho, vestuário e transferências.', pontuacao: 65, createdAt: diasAtras(20) },
];

const mesAtual = fmt(hoje).substring(0, 7);
const mesAnterior = (() => { const d = new Date(hoje); d.setMonth(d.getMonth() - 1); return fmt(d).substring(0, 7); })();
const mes2Atras = (() => { const d = new Date(hoje); d.setMonth(d.getMonth() - 2); return fmt(d).substring(0, 7); })();

export const mockCobrancas: Cobranca[] = [
  { id: 'c1', atendimentoId: 'a5', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: `${mesAtual}-07`, valor: 120, status: 'pago', formaPagamento: 'pix', dataPagamento: `${mesAtual}-08`, createdAt: `${mesAtual}-07` },
  { id: 'c2', atendimentoId: 'a6', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: `${mesAtual}-07`, valor: 120, status: 'pago', formaPagamento: 'transferencia', dataPagamento: `${mesAtual}-09`, createdAt: `${mesAtual}-07` },
  { id: 'c3', atendimentoId: 'a7', pacienteId: 'p3', pacienteNome: 'Dona Rosa Ferreira', data: `${mesAtual}-07`, valor: 150, status: 'pendente', createdAt: `${mesAtual}-07` },
  { id: 'c4', atendimentoId: 'a10', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: `${mesAtual}-01`, valor: 120, status: 'pago', formaPagamento: 'pix', dataPagamento: `${mesAtual}-02`, createdAt: `${mesAtual}-01` },
  { id: 'c5', atendimentoId: 'a1', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: fmt(hoje), valor: 120, status: 'pendente', createdAt: fmt(hoje) },
  { id: 'c6', atendimentoId: 'a2', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: fmt(hoje), valor: 120, status: 'pendente', createdAt: fmt(hoje) },
  // Mês anterior
  { id: 'c7', atendimentoId: 'x1', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: `${mesAnterior}-10`, valor: 120, status: 'pago', formaPagamento: 'pix', dataPagamento: `${mesAnterior}-11`, createdAt: `${mesAnterior}-10` },
  { id: 'c8', atendimentoId: 'x2', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: `${mesAnterior}-10`, valor: 120, status: 'pago', formaPagamento: 'cartao_credito', dataPagamento: `${mesAnterior}-12`, createdAt: `${mesAnterior}-10` },
  { id: 'c9', atendimentoId: 'x3', pacienteId: 'p3', pacienteNome: 'Dona Rosa Ferreira', data: `${mesAnterior}-15`, valor: 150, status: 'pago', formaPagamento: 'dinheiro', dataPagamento: `${mesAnterior}-15`, createdAt: `${mesAnterior}-15` },
  { id: 'c10', atendimentoId: 'x4', pacienteId: 'p4', pacienteNome: 'Roberto Alves Santos', data: `${mesAnterior}-20`, valor: 120, status: 'vencido', createdAt: `${mesAnterior}-20` },
  // 2 meses atrás
  { id: 'c11', atendimentoId: 'x5', pacienteId: 'p1', pacienteNome: 'Carlos Eduardo Mendes', data: `${mes2Atras}-05`, valor: 120, status: 'pago', formaPagamento: 'pix', dataPagamento: `${mes2Atras}-06`, createdAt: `${mes2Atras}-05` },
  { id: 'c12', atendimentoId: 'x6', pacienteId: 'p2', pacienteNome: 'Mariana Lima Costa', data: `${mes2Atras}-05`, valor: 120, status: 'pago', formaPagamento: 'transferencia', dataPagamento: `${mes2Atras}-07`, createdAt: `${mes2Atras}-05` },
  { id: 'c13', atendimentoId: 'x7', pacienteId: 'p3', pacienteNome: 'Dona Rosa Ferreira', data: `${mes2Atras}-12`, valor: 150, status: 'pago', formaPagamento: 'dinheiro', dataPagamento: `${mes2Atras}-12`, createdAt: `${mes2Atras}-12` },
];

export const mockSugestoes: SugestaoAtividade[] = [
  {
    id: 's1', titulo: 'Treino de AVDs com Adaptações', descricao: 'Treino de atividades de vida diária usando equipamentos adaptados como abotoadores, engrossadores de cabo e talheres adaptados.',
    categoria: 'AVDs', diagnosticosIndicados: ['neurológico', 'ortopédico'], tiposAtendimento: ['individual', 'domiciliar'],
    materiais: ['Abotoador', 'Engrossadores', 'Talheres adaptados'], duracaoEstimada: 45, nivelDificuldade: 'médio',
    objetivos: ['Aumentar independência nas AVDs', 'Melhorar destreza manual', 'Promover autonomia'],
  },
  {
    id: 's2', titulo: 'Caixa Sensorial Multitexturas', descricao: 'Exploração de diferentes texturas, temperaturas e materiais para estimulação sensorial e integração sensório-motora.',
    categoria: 'sensorial', diagnosticosIndicados: ['pediátrico', 'psiquiátrico'], tiposAtendimento: ['individual', 'grupo'],
    materiais: ['Areia cinética', 'Massinha', 'Tecidos variados', 'Objetos de diferentes texturas'], duracaoEstimada: 30, nivelDificuldade: 'fácil',
    objetivos: ['Estimular processamento sensorial', 'Reduzir hipersensibilidade', 'Promover exploração'],
  },
  {
    id: 's3', titulo: 'Treino de Marcha Funcional', descricao: 'Atividades para melhora do padrão de marcha, equilíbrio e transferências em ambiente simulado.',
    categoria: 'motricidade_grossa', diagnosticosIndicados: ['neurológico', 'geriátrico', 'ortopédico'], tiposAtendimento: ['individual', 'domiciliar'],
    materiais: ['Barras paralelas', 'Obstáculos', 'Tapetes antiderrapantes'], duracaoEstimada: 40, nivelDificuldade: 'difícil',
    objetivos: ['Melhorar equilíbrio dinâmico', 'Aumentar segurança na deambulação', 'Prevenir quedas'],
  },
  {
    id: 's4', titulo: 'Jogos Cognitivos com Cartas', descricao: 'Atividades com baralho e jogos de memória para estimulação de funções cognitivas como atenção, memória e raciocínio.',
    categoria: 'cognição', diagnosticosIndicados: ['neurológico', 'geriátrico', 'psiquiátrico'], tiposAtendimento: ['individual', 'grupo'],
    materiais: ['Baralho', 'Jogos de memória', 'Dominó'], duracaoEstimada: 30, nivelDificuldade: 'médio',
    objetivos: ['Estimular memória de trabalho', 'Melhorar atenção sustentada', 'Promover socialização'],
  },
  {
    id: 's5', titulo: 'Artesanato Terapêutico', descricao: 'Atividades de artesanato como pintura, bordado e origami para desenvolvimento de coordenação motora fina e expressão criativa.',
    categoria: 'motricidade_fina', diagnosticosIndicados: ['neurológico', 'ortopédico', 'psiquiátrico'], tiposAtendimento: ['individual', 'grupo'],
    materiais: ['Tintas', 'Pincéis', 'Papel', 'Linha e agulha'], duracaoEstimada: 50, nivelDificuldade: 'médio',
    objetivos: ['Aprimorar coordenação motora fina', 'Estimular criatividade', 'Promover bem-estar emocional'],
  },
];
