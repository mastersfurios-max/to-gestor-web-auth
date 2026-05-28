# TO Gestor Web — Guia de Implantação

## Pré-requisitos

- Node.js 18+ e pnpm instalados
- Qualquer servidor web estático (Nginx, Apache, Netlify, Vercel, GitHub Pages)

---

## Opção 1 — Usar os arquivos prontos (pasta `dist/`)

A pasta `dist/` já contém o build de produção. Basta hospedá-la em qualquer servidor estático.

### Netlify (recomendado — gratuito)
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Arraste a pasta `dist/` para a área de deploy
3. O sistema estará disponível em segundos com URL pública

### Vercel
```bash
npx vercel --prod
# Selecione a pasta dist/ quando solicitado
```

### Nginx
```nginx
server {
    listen 80;
    root /var/www/to-gestor-web/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Opção 2 — Build a partir do código-fonte

```bash
# Instalar dependências
pnpm install

# Rodar em modo desenvolvimento
pnpm dev

# Gerar build de produção
pnpm build

# Servir localmente para teste
pnpm preview
```

---

## Estrutura do Projeto

```
to-gestor-web/
├── src/
│   ├── pages/          ← Telas do sistema
│   │   ├── Dashboard.tsx
│   │   ├── Pacientes.tsx
│   │   ├── PacienteDetalhe.tsx
│   │   ├── PacienteForm.tsx
│   │   ├── Agenda.tsx
│   │   ├── AgendaForm.tsx
│   │   ├── AtendimentoDetalhe.tsx
│   │   ├── Clinico.tsx
│   │   ├── Financeiro.tsx
│   │   ├── RelatorioFinanceiro.tsx
│   │   ├── RelatorioPaciente.tsx
│   │   ├── Sugestoes.tsx
│   │   └── Configuracoes.tsx
│   ├── components/
│   │   ├── Layout.tsx  ← Sidebar + Topbar
│   │   └── ui.tsx      ← Componentes reutilizáveis
│   ├── context.tsx     ← Estado global (useReducer + localStorage)
│   ├── types.ts        ← Tipos TypeScript
│   ├── mock-data.ts    ← Dados de exemplo
│   └── utils.ts        ← Utilitários e formatadores
├── dist/               ← Build de produção (pronto para deploy)
└── vite.config.ts
```

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| Dashboard | Resumo do dia, atendimentos, estatísticas, ações rápidas |
| Pacientes | Cadastro, prontuário, abas (dados, avaliações, evoluções, atendimentos, financeiro) |
| Agenda | Visualização semanal, novo agendamento, detalhe com ações |
| Clínico | Registro de evoluções SOAP, avaliações funcionais (14 tipos) |
| Financeiro | Cobranças, modal de pagamento com forma, gráfico de receita |
| Relatórios | Relatório clínico por paciente e relatório financeiro com gráficos |
| Sugestões | Banco de atividades terapêuticas filtradas por categoria e diagnóstico |
| Configurações | Perfil do terapeuta, personalização visual (6 paletas, modo escuro) |

---

## Armazenamento de Dados

Os dados são armazenados no **localStorage** do navegador. Isso significa:
- Sem necessidade de servidor ou banco de dados
- Dados persistem entre sessões no mesmo navegador
- Para backup: use a função de exportação (a implementar)
- Para múltiplos dispositivos: necessário backend (disponível sob demanda)
