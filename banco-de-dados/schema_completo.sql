-- =====================================================
-- EventSync - Schema Completo para Supabase
-- Versão: 2.0
-- Data: 2025-12-12
-- =====================================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Crie um novo projeto no Supabase (https://supabase.com)
-- 2. Vá em "SQL Editor" no menu lateral
-- 3. Clique em "New Query"
-- 4. Cole TODO este conteúdo e clique em "Run"
-- 5. Vá em "Authentication" > "Providers" e habilite "Email"
-- 6. Desabilite "Confirm email" em Auth > Settings para testes
-- 7. Copie sua URL e Anon Key do projeto
--
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS (Tipos personalizados)
-- =====================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'organizer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'finished');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected', 'checked_in', 'awaiting_payment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('info', 'success', 'warning', 'event', 'friendship');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABELA: profiles
-- Estende a autenticação do Supabase
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'user',
  bio TEXT,
  visibilidade_participacao BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles são visíveis por todos" ON public.profiles;
CREATE POLICY "Profiles são visíveis por todos"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem inserir próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- TABELA: events
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  requires_checkin_for_certificate BOOLEAN NOT NULL DEFAULT true,
  max_capacity INTEGER,
  status event_status NOT NULL DEFAULT 'draft',
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Eventos publicados são visíveis por todos" ON public.events;
CREATE POLICY "Eventos publicados são visíveis por todos"
  ON public.events FOR SELECT
  USING (status = 'published' OR organizer_id = auth.uid());

DROP POLICY IF EXISTS "Organizadores podem inserir eventos" ON public.events;
CREATE POLICY "Organizadores podem inserir eventos"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizadores podem atualizar próprios eventos" ON public.events;
CREATE POLICY "Organizadores podem atualizar próprios eventos"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizadores podem deletar próprios eventos" ON public.events;
CREATE POLICY "Organizadores podem deletar próprios eventos"
  ON public.events FOR DELETE
  USING (auth.uid() = organizer_id);

-- =====================================================
-- TABELA: registrations
-- =====================================================

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'pending',
  qr_code_hash TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  payment_code TEXT,
  checkin_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprias inscrições" ON public.registrations;
CREATE POLICY "Usuários podem ver próprias inscrições"
  ON public.registrations FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem se inscrever em eventos" ON public.registrations;
CREATE POLICY "Usuários podem se inscrever em eventos"
  ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organizadores podem atualizar inscrições" ON public.registrations;
CREATE POLICY "Organizadores podem atualizar inscrições"
  ON public.registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = registrations.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem cancelar próprias inscrições" ON public.registrations;
CREATE POLICY "Usuários podem cancelar próprias inscrições"
  ON public.registrations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: friendships
-- Amizades contextuais (surgem dentro de eventos)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_context_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id, event_context_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprias amizades" ON public.friendships;
CREATE POLICY "Usuários podem ver próprias amizades"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Usuários podem criar solicitações de amizade" ON public.friendships;
CREATE POLICY "Usuários podem criar solicitações de amizade"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Usuários podem atualizar solicitações recebidas" ON public.friendships;
CREATE POLICY "Usuários podem atualizar solicitações recebidas"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Usuários podem deletar próprias amizades" ON public.friendships;
CREATE POLICY "Usuários podem deletar próprias amizades"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- =====================================================
-- TABELA: messages
-- Chat entre amigos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprias mensagens" ON public.messages;
CREATE POLICY "Usuários podem ver próprias mensagens"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Usuários podem enviar mensagens" ON public.messages;
CREATE POLICY "Usuários podem enviar mensagens"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Usuários podem atualizar mensagens recebidas" ON public.messages;
CREATE POLICY "Usuários podem atualizar mensagens recebidas (marcar como lida)"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- =====================================================
-- TABELA: reviews
-- Avaliações de eventos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews são visíveis por todos" ON public.reviews;
CREATE POLICY "Reviews são visíveis por todos"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuários podem criar reviews" ON public.reviews;
CREATE POLICY "Usuários podem criar reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprias reviews" ON public.reviews;
CREATE POLICY "Usuários podem atualizar próprias reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: notifications
-- Sistema de notificações
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprias notificações" ON public.notifications;
CREATE POLICY "Usuários podem ver próprias notificações"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;
CREATE POLICY "Sistema pode criar notificações"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar próprias notificações" ON public.notifications;
CREATE POLICY "Usuários podem atualizar próprias notificações"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar próprias notificações" ON public.notifications;
CREATE POLICY "Usuários podem deletar próprias notificações"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO: handle_new_user
-- Cria perfil automaticamente ao cadastrar
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir e criar novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNÇÃO: get_organizer_rating
-- Retorna a média de avaliações do organizador
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_organizer_rating(organizer_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(r.rating)::NUMERIC(3,2), 0)
  FROM public.reviews r
  JOIN public.events e ON e.id = r.event_id
  WHERE e.organizer_id = organizer_uuid
$$;

-- =====================================================
-- ÍNDICES para performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_hash ON public.registrations(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON public.friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_reviews_event ON public.reviews(event_id);

-- =====================================================
-- FIM DO SCHEMA - Execute este script no SQL Editor
-- =====================================================
