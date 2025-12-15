# 🚀 EventSync - Configuração do Supabase

Este guia explica como configurar seu próprio projeto Supabase para o EventSync.

---

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**
4. Escolha sua organização
5. Preencha:
   - **Name**: `eventsync` (ou outro nome)
   - **Database Password**: Crie uma senha forte (guarde ela!)
   - **Region**: Escolha o mais próximo (ex: `South America (São Paulo)`)
6. Clique em **"Create new project"**
7. Aguarde ~2 minutos a criação

---

### 2. Executar o Schema SQL

1. No menu lateral, vá em **"SQL Editor"**
2. Clique em **"New Query"**
3. Abra o arquivo `docs/schema_completo.sql` deste projeto
4. **Copie TODO o conteúdo** e cole no editor
5. Clique no botão **"Run"** (ou Ctrl+Enter)
6. Aguarde a mensagem de sucesso

---

### 3. Configurar Autenticação

1. Vá em **"Authentication"** no menu lateral
2. Clique em **"Providers"**
3. Verifique se **"Email"** está habilitado
4. Vá em **"Auth Settings"** (ou URL Configuration)
5. **Para desenvolvimento**, desabilite:
   - ☐ **Confirm email** (desmarque para facilitar testes)
6. Salve as alterações

---

### 4. Obter Credenciais

1. Vá em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Copie os valores:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** → `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

---

### 5. Configurar o Projeto

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui
```

**⚠️ IMPORTANTE:** 
- Substitua `SEU_PROJECT_ID` pela URL copiada
- Substitua `sua_anon_key_aqui` pela chave `anon public`
- **NUNCA** use a `service_role` key no frontend!

---

### 6. Reiniciar o App

Após configurar o `.env`:

```bash
# Pare o servidor (Ctrl+C)
# Reinicie
npm run dev
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados dos usuários (nome, avatar, bio, role) |
| `events` | Eventos criados pelos organizadores |
| `registrations` | Inscrições dos participantes em eventos |
| `friendships` | Conexões de amizade entre participantes |
| `messages` | Chat entre amigos |
| `reviews` | Avaliações dos eventos |
| `notifications` | Notificações do sistema |

### Enums

| Enum | Valores |
|------|---------|
| `app_role` | `user`, `organizer` |
| `event_status` | `draft`, `published`, `finished` |
| `registration_status` | `pending`, `approved`, `rejected`, `checked_in` |
| `friendship_status` | `pending`, `accepted` |
| `notification_type` | `info`, `success`, `warning`, `event`, `friendship` |

---

## 🔐 Segurança (RLS)

Todas as tabelas possuem **Row Level Security** ativado:

- ✅ Usuários só veem seus próprios dados
- ✅ Organizadores gerenciam apenas seus eventos
- ✅ Inscrições são visíveis apenas para dono e organizador
- ✅ Perfis públicos são visíveis por todos

---

## 🧪 Testando

1. Acesse o app e crie uma conta
2. Verifique no Supabase:
   - **Table Editor** → `profiles` → Deve ter seu usuário
3. Crie um evento e verifique em `events`
4. Se inscreva e verifique em `registrations`

---

## ❓ Problemas Comuns

### "Invalid API key"
- Verifique se copiou a chave `anon public` corretamente
- Verifique se o `.env` está na raiz do projeto
- Reinicie o servidor

### "User already registered"  
- Email já cadastrado, use outro ou faça login

### "new row violates row-level security policy"
- Verifique se está logado antes de criar dados
- Verifique se o `user_id` está correto

### Perfil não criado automaticamente
- Verifique se o trigger `on_auth_user_created` foi criado
- Execute novamente o SQL do schema

---

## 📞 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)

---

**Pronto!** Seu EventSync agora está conectado ao seu próprio Supabase! 🎉
