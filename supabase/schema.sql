-- ============================================================
-- TO Gestor — Schema do Banco de Dados Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── CLÍNICAS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinicas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        TEXT NOT NULL,
  cnpj        TEXT,
  telefone    TEXT,
  email       TEXT,
  endereco    TEXT,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── USUÁRIOS (perfis) ─────────────────────────────────────────────────────
CREATE TYPE perfil_usuario AS ENUM ('admin', 'terapeuta', 'secretaria');

CREATE TABLE IF NOT EXISTS public.usuarios (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id            UUID REFERENCES public.clinicas(id) ON DELETE SET NULL,
  nome                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  perfil                perfil_usuario NOT NULL DEFAULT 'terapeuta',
  registro_profissional TEXT,
  especialidade         TEXT,
  telefone              TEXT,
  valor_padrao_sessao   NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  duracao_padrao_sessao INTEGER NOT NULL DEFAULT 50,
  ativo                 BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PACIENTES ─────────────────────────────────────────────────────────────
CREATE TYPE categoria_diagnostico AS ENUM (
  'neurológico', 'ortopédico', 'psiquiátrico', 'pediátrico',
  'geriátrico', 'oncológico', 'outro'
);

CREATE TABLE IF NOT EXISTS public.pacientes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id            UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  terapeuta_id          UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  nome                  TEXT NOT NULL,
  data_nascimento       DATE,
  cpf                   TEXT,
  telefone              TEXT,
  email                 TEXT,
  endereco              TEXT,
  responsavel           TEXT,
  telefone_responsavel  TEXT,
  diagnostico_principal TEXT NOT NULL DEFAULT '',
  categoria_diagnostico categoria_diagnostico NOT NULL DEFAULT 'outro',
  cid                   TEXT,
  plano_saude           TEXT,
  numero_carteirinha    TEXT,
  observacoes           TEXT,
  ativo                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ATENDIMENTOS ──────────────────────────────────────────────────────────
CREATE TYPE status_atendimento AS ENUM ('confirmado', 'pendente', 'cancelado', 'realizado');
CREATE TYPE tipo_atendimento AS ENUM (
  'individual', 'grupo', 'domiciliar', 'hospitalar', 'escolar', 'teleAtendimento'
);

CREATE TABLE IF NOT EXISTS public.atendimentos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id      UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  paciente_id     UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  terapeuta_id    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data            DATE NOT NULL,
  horario_inicio  TIME NOT NULL,
  horario_fim     TIME NOT NULL,
  tipo            tipo_atendimento NOT NULL DEFAULT 'individual',
  status          status_atendimento NOT NULL DEFAULT 'pendente',
  local           TEXT,
  observacoes     TEXT,
  valor_sessao    NUMERIC(10,2) NOT NULL DEFAULT 0,
  cobrado         BOOLEAN NOT NULL DEFAULT FALSE,
  evolucao_id     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── EVOLUÇÕES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.evolucoes (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id                  UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  paciente_id                 UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  terapeuta_id                UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  atendimento_id              UUID REFERENCES public.atendimentos(id) ON DELETE SET NULL,
  data                        DATE NOT NULL,
  queixa_principal            TEXT,
  objetivos_sessao            TEXT NOT NULL DEFAULT '',
  atividades_realizadas       TEXT NOT NULL DEFAULT '',
  resposta_paciente           TEXT NOT NULL DEFAULT '',
  observacoes_clinicas        TEXT,
  planejamento_proxima_sessao TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AVALIAÇÕES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id   UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  paciente_id  UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  terapeuta_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL,
  data         DATE NOT NULL,
  resultado    TEXT NOT NULL DEFAULT '',
  pontuacao    NUMERIC(10,2),
  observacoes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── COBRANÇAS ─────────────────────────────────────────────────────────────
CREATE TYPE status_pagamento AS ENUM ('pago', 'pendente', 'vencido', 'isento');
CREATE TYPE forma_pagamento AS ENUM (
  'dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia', 'plano_saude'
);

CREATE TABLE IF NOT EXISTS public.cobrancas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id      UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  atendimento_id  UUID NOT NULL REFERENCES public.atendimentos(id) ON DELETE CASCADE,
  paciente_id     UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  terapeuta_id    UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data            DATE NOT NULL,
  valor           NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          status_pagamento NOT NULL DEFAULT 'pendente',
  forma_pagamento forma_pagamento,
  data_pagamento  DATE,
  observacoes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SUGESTÕES DE ATIVIDADES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sugestoes_atividades (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id            UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  titulo                TEXT NOT NULL,
  descricao             TEXT NOT NULL DEFAULT '',
  categoria             TEXT NOT NULL,
  diagnosticos_indicados TEXT[] NOT NULL DEFAULT '{}',
  tipos_atendimento     TEXT[] NOT NULL DEFAULT '{}',
  materiais             TEXT[] NOT NULL DEFAULT '{}',
  duracao_estimada      INTEGER,
  nivel_dificuldade     TEXT NOT NULL DEFAULT 'médio',
  objetivos             TEXT[] NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sugestoes_favoritas (
  usuario_id   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  sugestao_id  UUID NOT NULL REFERENCES public.sugestoes_atividades(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, sugestao_id)
);

-- ── TRIGGER: updated_at automático ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['clinicas','usuarios','pacientes','atendimentos','evolucoes','avaliacoes','cobrancas']
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- ── TRIGGER: criar perfil ao registrar usuário no Auth ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::perfil_usuario, 'terapeuta')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes_favoritas ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna clinica_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_clinica_id()
RETURNS UUID AS $$
  SELECT clinica_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Função auxiliar: retorna perfil do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_perfil()
RETURNS TEXT AS $$
  SELECT perfil::TEXT FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Políticas: clinicas
CREATE POLICY "Usuários veem sua clínica" ON public.clinicas
  FOR SELECT USING (id = public.get_user_clinica_id());
CREATE POLICY "Admin edita sua clínica" ON public.clinicas
  FOR UPDATE USING (id = public.get_user_clinica_id() AND public.get_user_perfil() = 'admin');

-- Políticas: usuarios
CREATE POLICY "Usuários veem colegas da mesma clínica" ON public.usuarios
  FOR SELECT USING (clinica_id = public.get_user_clinica_id());
CREATE POLICY "Usuário vê a si mesmo" ON public.usuarios
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admin gerencia usuários da clínica" ON public.usuarios
  FOR ALL USING (clinica_id = public.get_user_clinica_id() AND public.get_user_perfil() = 'admin');
CREATE POLICY "Usuário atualiza próprio perfil" ON public.usuarios
  FOR UPDATE USING (id = auth.uid());

-- Políticas: pacientes
CREATE POLICY "Usuários da clínica veem pacientes" ON public.pacientes
  FOR SELECT USING (clinica_id = public.get_user_clinica_id());
CREATE POLICY "Admin e terapeuta gerenciam pacientes" ON public.pacientes
  FOR ALL USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );

-- Políticas: atendimentos
CREATE POLICY "Usuários da clínica veem atendimentos" ON public.atendimentos
  FOR SELECT USING (clinica_id = public.get_user_clinica_id());
CREATE POLICY "Admin e terapeuta gerenciam atendimentos" ON public.atendimentos
  FOR ALL USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );
CREATE POLICY "Secretária insere e atualiza atendimentos" ON public.atendimentos
  FOR INSERT WITH CHECK (clinica_id = public.get_user_clinica_id());

-- Políticas: evolucoes
CREATE POLICY "Admin e terapeuta veem evoluções" ON public.evolucoes
  FOR SELECT USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );
CREATE POLICY "Admin e terapeuta gerenciam evoluções" ON public.evolucoes
  FOR ALL USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );

-- Políticas: avaliacoes
CREATE POLICY "Admin e terapeuta veem avaliações" ON public.avaliacoes
  FOR SELECT USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );
CREATE POLICY "Admin e terapeuta gerenciam avaliações" ON public.avaliacoes
  FOR ALL USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );

-- Políticas: cobrancas
CREATE POLICY "Usuários da clínica veem cobranças" ON public.cobrancas
  FOR SELECT USING (clinica_id = public.get_user_clinica_id());
CREATE POLICY "Admin e secretária gerenciam cobranças" ON public.cobrancas
  FOR ALL USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'secretaria', 'terapeuta')
  );

-- Políticas: sugestoes_atividades
CREATE POLICY "Todos da clínica veem sugestões" ON public.sugestoes_atividades
  FOR SELECT USING (clinica_id IS NULL OR clinica_id = public.get_user_clinica_id());
CREATE POLICY "Admin e terapeuta gerenciam sugestões" ON public.sugestoes_atividades
  FOR ALL USING (
    clinica_id = public.get_user_clinica_id()
    AND public.get_user_perfil() IN ('admin', 'terapeuta')
  );

-- Políticas: sugestoes_favoritas
CREATE POLICY "Usuário gerencia próprios favoritos" ON public.sugestoes_favoritas
  FOR ALL USING (usuario_id = auth.uid());

-- ── DADOS INICIAIS: Clínica e Admin ──────────────────────────────────────
-- Execute após criar o primeiro usuário admin no Supabase Auth
-- Substitua 'SEU_USER_ID_AQUI' pelo UUID do usuário criado

/*
-- 1. Crie a clínica:
INSERT INTO public.clinicas (nome, email)
VALUES ('Minha Clínica de Terapia Ocupacional', 'contato@clinica.com')
RETURNING id;

-- 2. Associe o admin à clínica (use o ID retornado acima):
UPDATE public.usuarios
SET clinica_id = 'ID_DA_CLINICA_AQUI', perfil = 'admin'
WHERE id = 'SEU_USER_ID_AQUI';
*/
