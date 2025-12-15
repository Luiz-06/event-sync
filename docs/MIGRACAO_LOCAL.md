# 🎓 Guia de Migração - EventSync

Este guia detalha **TODOS** os passos para migrar o projeto para um repositório local próprio.

---

## 📋 Checklist Rápido

- [ ] Copiar arquivos para novo repositório
- [ ] Excluir arquivos/pastas desnecessários
- [ ] Criar projeto no Supabase
- [ ] Executar schema SQL
- [ ] Configurar variáveis de ambiente
- [ ] Instalar dependências
- [ ] Testar aplicação

---

## 🗑️ ARQUIVOS PARA EXCLUIR (OBRIGATÓRIO)

Após copiar o projeto, **EXCLUA** estes arquivos/pastas:

```bash
# Excluir pasta do Lovable Cloud
rm -rf supabase/

# Excluir arquivos de configuração específicos
rm -rf .lovable/

# Excluir arquivo de lock (será regenerado)
rm bun.lock

# Excluir node_modules (será reinstalado)
rm -rf node_modules/

# Excluir pasta docs após seguir as instruções
rm -rf docs/
```

---

## 📝 ARQUIVOS PARA ALTERAR

### 1. **README.md** - SUBSTITUIR COMPLETAMENTE

Substitua todo o conteúdo por algo assim:

```markdown
# EventSync - Sistema de Gestão de Eventos

Sistema de gerenciamento de eventos com check-in via QR Code.

## Tecnologias Utilizadas

- React 19
- TypeScript
- Vite
- TailwindCSS
- Shadcn/UI
- Supabase (Backend)

## Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o `.env` com suas credenciais do Supabase
4. Execute: `npm run dev`

## Funcionalidades

- Autenticação de usuários
- Criação e gestão de eventos
- Inscrições com aprovação
- Check-in via QR Code
- Sistema social entre participantes
- Perfis de usuário personalizáveis

## Autor

[SEU NOME AQUI]
```

---

### 2. **.env** - CRIAR/ALTERAR

O arquivo `.env` precisa ser **CRIADO** com suas credenciais do Supabase:

```env
# Cole a URL do seu projeto Supabase
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co

# Cole a chave anon/public do seu projeto
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_aqui

# ID do projeto (opcional)
VITE_SUPABASE_PROJECT_ID=SEU_PROJECT_ID
```

**ONDE ENCONTRAR:**
1. Acesse [supabase.com](https://supabase.com)
2. Vá em **Project Settings** → **API**
3. Copie: **Project URL** e **anon public key**

---

### 3. **src/integrations/supabase/client.ts** - VERIFICAR

Este arquivo já está configurado para ler do `.env`. **NÃO PRECISA ALTERAR**, apenas verifique se está assim:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

### 4. **src/integrations/supabase/types.ts** - REGENERAR (OPCIONAL)

Se alterar o schema do banco, regenere usando:

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/integrations/supabase/types.ts
```

---

### 5. **package.json** - ALTERAR METADADOS

Edite as informações do projeto:

```json
{
  "name": "eventsync",
  "description": "Sistema de gestão de eventos com QR Code",
  "author": "SEU NOME",
  "version": "1.0.0"
}
```

---

### 6. **index.html** - ALTERAR TÍTULO

```html
<head>
  <title>EventSync - Gestão de Eventos</title>
  <meta name="description" content="Sistema desenvolvido por [SEU NOME]">
</head>
```

---

## 💻 EXECUTANDO LOCALMENTE

```bash
# 1. Navegue até a pasta do projeto
cd eventsync

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# http://localhost:5173
```

---

## 🔍 ESTRUTURA DO PROJETO

```
eventsync/
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   │   ├── ui/           # Componentes Shadcn/UI
│   │   ├── events/       # Componentes de eventos
│   │   ├── tickets/      # Componentes de ingressos
│   │   ├── profile/      # Componentes de perfil
│   │   └── layout/       # Layout e navegação
│   │
│   ├── pages/            # Páginas da aplicação
│   │   ├── Index.tsx     # Home (lista de eventos)
│   │   ├── Auth.tsx      # Login/Cadastro
│   │   ├── Profile.tsx   # Perfil do usuário
│   │   ├── Tickets.tsx   # Ingressos do usuário
│   │   ├── EventDetails.tsx  # Detalhes do evento
│   │   ├── CreateEvent.tsx   # Criar evento
│   │   ├── EditEvent.tsx     # Editar evento
│   │   └── ManageEvent.tsx   # Gerenciar evento
│   │
│   ├── contexts/         # Contextos React (Auth)
│   ├── hooks/            # Hooks customizados
│   ├── integrations/     # Integração com Supabase
│   ├── types/            # Tipos TypeScript
│   ├── lib/              # Utilitários
│   └── index.css         # Estilos globais
│
├── docs/                 # Documentação (EXCLUIR DEPOIS)
├── public/               # Arquivos estáticos
├── package.json          # Dependências
└── .env                  # Variáveis de ambiente (CRIAR!)
```

---

## ❓ SOLUÇÃO DE PROBLEMAS

### Erro: "Invalid API key"
- Verifique se o `.env` está na raiz do projeto
- Verifique se copiou a chave `anon public`
- Reinicie o servidor

### Erro: "relation does not exist"
- Execute o `schema_completo.sql` no Supabase SQL Editor

### Página em branco
- Abra o console do navegador (F12)
- Verifique se o `.env` está configurado

---

## ✅ CHECKLIST FINAL

- [ ] Removi a pasta `docs/` e `supabase/`
- [ ] Alterei o README.md com minhas informações
- [ ] Configurei o Supabase com meu projeto
- [ ] O `.env` está com minhas credenciais
- [ ] A aplicação roda localmente sem erros
- [ ] Entendo a estrutura do código

---

**Boa sorte com seu TCC!** 🎓
