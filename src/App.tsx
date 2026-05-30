import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context';
import { AuthProvider } from './lib/auth-context';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import PacienteDetalhe from './pages/PacienteDetalhe';
import PacienteForm from './pages/PacienteForm';
import RelatorioPaciente from './pages/RelatorioPaciente';
import Agenda from './pages/Agenda';
import AgendaForm from './pages/AgendaForm';
import AtendimentoDetalhe from './pages/AtendimentoDetalhe';
import Clinico, { NovaEvolucao, NovaAvaliacao } from './pages/Clinico';
import Financeiro from './pages/Financeiro';
import RelatorioFinanceiro from './pages/RelatorioFinanceiro';
import Sugestoes from './pages/Sugestoes';
import Configuracoes from './pages/Configuracoes';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
       <BrowserRouter basename="/to-gestor-web-auth">
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas — qualquer perfil autenticado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />

                {/* Pacientes — todos os perfis */}
<Route path="pacientes" element={<Pacientes />} />
<Route path="pacientes/:id" element={<PacienteDetalhe />} />
<Route path="pacientes/:id/relatorio" element={<RelatorioPaciente />} />

{/* Apenas Admin e Secretária */}
<Route element={<ProtectedRoute perfisPermitidos={['admin', 'secretaria']} />}>
  <Route path="pacientes/novo" element={<PacienteForm />} />
  <Route path="pacientes/:id/editar" element={<PacienteForm />} />
</Route>

                {/* Agenda — todos os perfis */}
               <Route path="agenda" element={<Agenda />} />
<Route path="agenda/:id" element={<AtendimentoDetalhe />} />

<Route element={<ProtectedRoute perfisPermitidos={['admin', 'secretaria']} />}>
  <Route path="agenda/novo" element={<AgendaForm />} />
</Route>

                {/* Clínico — admin e terapeuta */}
                <Route element={<ProtectedRoute perfisPermitidos={['admin', 'terapeuta']} />}>
                  <Route path="clinico" element={<Clinico />} />
                  <Route path="clinico/nova-evolucao" element={<NovaEvolucao />} />
                  <Route path="clinico/nova-avaliacao" element={<NovaAvaliacao />} />
                </Route>

                {/* Financeiro — todos os perfis */}
                <Route element={<ProtectedRoute perfisPermitidos={['admin', 'secretaria']} />}>
  <Route path="financeiro" element={<Financeiro />} />
  <Route path="financeiro/relatorio" element={<RelatorioFinanceiro />} />
</Route>

                {/* Sugestões — admin e terapeuta */}
                <Route element={<ProtectedRoute perfisPermitidos={['admin', 'terapeuta']} />}>
                  <Route path="sugestoes" element={<Sugestoes />} />
                </Route>

                {/* Administração — somente admin */}
                <Route element={<ProtectedRoute perfisPermitidos={['admin']} />}>
                  <Route path="admin" element={<Admin />} />
                </Route>

                {/* Configurações — todos */}
                <Route path="configuracoes" element={<Configuracoes />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
