export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateBR(dateStr: string) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function hoje(): string {
  return new Date().toISOString().split('T')[0];
}

export const TIPO_LABELS: Record<string, string> = {
  individual: 'Individual', grupo: 'Grupo', domiciliar: 'Domiciliar',
  hospitalar: 'Hospitalar', escolar: 'Escolar', teleAtendimento: 'Teleatendimento',
};

export const STATUS_AT_LABELS: Record<string, string> = {
  confirmado: 'Confirmado', pendente: 'Pendente', cancelado: 'Cancelado', realizado: 'Realizado',
};

export const STATUS_AT_COLORS: Record<string, string> = {
  confirmado: '#2980B9', pendente: '#F39C12', cancelado: '#E74C3C', realizado: '#27AE60',
};

export const STATUS_PAG_LABELS: Record<string, string> = {
  pago: 'Pago', pendente: 'Pendente', vencido: 'Vencido', isento: 'Isento',
};

export const STATUS_PAG_COLORS: Record<string, string> = {
  pago: '#27AE60', pendente: '#F39C12', vencido: '#E74C3C', isento: '#6B7280',
};

export const FORMA_PAG_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro', pix: 'PIX', cartao_credito: 'Cartão Crédito',
  cartao_debito: 'Cartão Débito', transferencia: 'Transferência', plano_saude: 'Plano de Saúde',
};

export const CATEGORIA_DIAG_LABELS: Record<string, string> = {
  neurológico: 'Neurológico', ortopédico: 'Ortopédico', psiquiátrico: 'Psiquiátrico',
  pediátrico: 'Pediátrico', geriátrico: 'Geriátrico', oncológico: 'Oncológico', outro: 'Outro',
};

export const CATEGORIA_DIAG_COLORS: Record<string, string> = {
  neurológico: '#6366F1', ortopédico: '#F59E0B', psiquiátrico: '#EC4899',
  pediátrico: '#3B82F6', geriátrico: '#8B5CF6', oncológico: '#EF4444', outro: '#6B7280',
};
