# 📚 EventSync - Documentação Completa do Projeto

---

## 📖 Sumário

1. [Visão Geral](#-visão-geral)
2. [Problema e Solução](#-problema-e-solução)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Arquitetura do Sistema](#-arquitetura-do-sistema)
5. [Estrutura de Pastas](#-estrutura-de-pastas)
6. [Funcionalidades](#-funcionalidades)
7. [Banco de Dados](#-banco-de-dados)
8. [Autenticação e Segurança](#-autenticação-e-segurança)
9. [Componentes Principais](#-componentes-principais)
10. [Fluxos de Usuário](#-fluxos-de-usuário)
11. [Estilização e Design System](#-estilização-e-design-system)

---

## 🎯 Visão Geral

**EventSync** é uma plataforma web de gerenciamento de eventos híbridos (presenciais e online) com foco em:

- **Gestão completa de eventos** por organizadores
- **Inscrições e check-in** via QR Code para participantes
- **Rede social contextualizada** entre participantes do mesmo evento
- **Interface mobile-first** para uso em dispositivos móveis

### Público-Alvo

| Tipo de Usuário | Descrição |
|-----------------|-----------|
| **Participante** | Usuários que buscam eventos, se inscrevem e participam |
| **Organizador** | Usuários que criam, gerenciam eventos e fazem check-in |

---

## 💡 Problema e Solução

### Problema Identificado

1. Dificuldade em gerenciar inscrições de eventos de forma digital
2. Check-in manual é lento e propenso a erros
3. Falta de networking entre participantes de eventos
4. Plataformas existentes são complexas ou caras

### Solução Proposta

O EventSync oferece:

- ✅ **Inscrições online** com aprovação automática ou manual
- ✅ **QR Code único** para cada inscrição
- ✅ **Check-in instantâneo** via leitura de QR Code
- ✅ **Conexões sociais** restritas ao contexto do evento
- ✅ **Interface simples** e intuitiva

---

## 🛠 Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **React** | 19.x | Biblioteca de UI reativa |
| **TypeScript** | 5.x | Tipagem estática para JavaScript |
| **Vite** | 7.x | Build tool e dev server |
| **TailwindCSS** | 3.x | Framework CSS utilitário |
| **Shadcn/UI** | - | Biblioteca de componentes acessíveis |
| **Lucide React** | - | Ícones SVG |
| **React Router** | 6.x | Roteamento SPA |
| **React Query** | 5.x | Gerenciamento de estado servidor |
| **React Hook Form** | 7.x | Gerenciamento de formulários |
| **Zod** | 4.x | Validação de schemas |

### Backend (BaaS)

| Tecnologia | Função |
|------------|--------|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Banco de dados relacional |
| **Supabase Auth** | Autenticação de usuários |
| **Row Level Security** | Segurança a nível de linha |

### Bibliotecas Auxiliares

| Biblioteca | Função |
|------------|--------|
| **react-qr-code** | Geração de QR Codes |
| **html5-qrcode** | Leitura de QR Codes via câmera |
| **date-fns** | Manipulação de datas |
| **sonner** | Notificações toast |
| **jspdf** | Geração de PDFs (certificados) |

---

## 🏗 Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (React + Vite)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │  Contexts   │         │
│  │  (Rotas)    │  │    (UI)     │  │   (Estado)  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│              ┌───────────▼───────────┐                     │
│              │   Supabase Client     │                     │
│              │ (integrations/supabase)│                     │
│              └───────────┬───────────┘                     │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND                               │
│                      (Supabase)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │  Database   │  │   Storage   │         │
│  │ (Usuários)  │  │ (PostgreSQL)│  │  (Arquivos) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │              Row Level Security                  │       │
│  │         (Políticas de Segurança)                │       │
│  └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
eventsync/
│
├── 📁 docs/                      # Documentação do projeto
│   ├── DOCUMENTACAO.md           # Este arquivo
│   ├── MIGRACAO_LOCAL.md         # Guia de migração
│   ├── SETUP_SUPABASE.md         # Configuração do Supabase
│   └── schema_completo.sql       # Schema do banco de dados
│
├── 📁 public/                    # Arquivos estáticos públicos
│   ├── favicon.ico               # Ícone do site
│   ├── placeholder.svg           # Imagem placeholder
│   └── robots.txt                # Configuração para crawlers
│
├── 📁 src/                       # Código fonte principal
│   │
│   ├── 📁 components/            # Componentes React reutilizáveis
│   │   │
│   │   ├── 📁 ui/                # Componentes Shadcn/UI (base)
│   │   │   ├── button.tsx        # Botões
│   │   │   ├── card.tsx          # Cards
│   │   │   ├── dialog.tsx        # Modais
│   │   │   ├── input.tsx         # Campos de entrada
│   │   │   ├── badge.tsx         # Badges/Tags
│   │   │   ├── toast.tsx         # Notificações
│   │   │   ├── tabs.tsx          # Abas
│   │   │   ├── avatar.tsx        # Avatares
│   │   │   ├── skeleton.tsx      # Loading placeholders
│   │   │   ├── empty.tsx         # Estado vazio
│   │   │   └── ... (outros)      # +40 componentes UI
│   │   │
│   │   ├── 📁 events/            # Componentes específicos de eventos
│   │   │   ├── EventCard.tsx     # Card de evento na listagem
│   │   │   └── EventFilters.tsx  # Filtros de busca de eventos
│   │   │
│   │   ├── 📁 tickets/           # Componentes de ingressos
│   │   │   ├── TicketCard.tsx    # Card do ingresso do usuário
│   │   │   └── QRCodeModal.tsx   # Modal com QR Code
│   │   │
│   │   ├── 📁 profile/           # Componentes de perfil
│   │   │   └── EditProfileModal.tsx # Modal de edição de perfil
│   │   │
│   │   ├── 📁 layout/            # Componentes de layout
│   │   │   ├── AppLayout.tsx     # Layout principal da aplicação
│   │   │   └── BottomNav.tsx     # Navegação inferior mobile
│   │   │
│   │   └── NavLink.tsx           # Link de navegação customizado
│   │
│   ├── 📁 pages/                 # Páginas da aplicação (rotas)
│   │   ├── Index.tsx             # Home - Lista de eventos
│   │   ├── Auth.tsx              # Login e Cadastro
│   │   ├── Profile.tsx           # Perfil do usuário
│   │   ├── Tickets.tsx           # Meus ingressos
│   │   ├── EventDetails.tsx      # Detalhes de um evento
│   │   ├── CreateEvent.tsx       # Criar novo evento
│   │   ├── EditEvent.tsx         # Editar evento existente
│   │   ├── ManageEvent.tsx       # Gerenciar evento (organizador)
│   │   ├── Social.tsx            # Rede social / Amigos
│   │   └── NotFound.tsx          # Página 404
│   │
│   ├── 📁 contexts/              # Contextos React (estado global)
│   │   └── AuthContext.tsx       # Contexto de autenticação
│   │
│   ├── 📁 hooks/                 # Hooks customizados
│   │   ├── use-mobile.tsx        # Detecta se é mobile
│   │   └── use-toast.ts          # Hook para notificações
│   │
│   ├── 📁 integrations/          # Integrações externas
│   │   └── 📁 supabase/
│   │       ├── client.ts         # Cliente Supabase configurado
│   │       └── types.ts          # Tipos TypeScript do banco
│   │
│   ├── 📁 types/                 # Tipos TypeScript customizados
│   │   ├── database.ts           # Tipos do banco de dados
│   │   └── html5-qrcode.d.ts     # Declaração de tipos
│   │
│   ├── 📁 lib/                   # Utilitários
│   │   └── utils.ts              # Funções auxiliares (cn, etc)
│   │
│   ├── App.tsx                   # Componente raiz e rotas
│   ├── App.css                   # Estilos específicos do App
│   ├── index.css                 # Estilos globais e design system
│   ├── main.tsx                  # Ponto de entrada da aplicação
│   └── vite-env.d.ts             # Tipos do Vite
│
├── .env                          # Variáveis de ambiente
├── index.html                    # HTML principal
├── package.json                  # Dependências e scripts
├── tailwind.config.ts            # Configuração do Tailwind
├── vite.config.ts                # Configuração do Vite
└── tsconfig.json                 # Configuração TypeScript
```

---

## ⚡ Funcionalidades

### 1. Autenticação de Usuários

| Funcionalidade | Descrição |
|----------------|-----------|
| **Cadastro** | Registro com email e senha |
| **Login** | Autenticação com email e senha |
| **Logout** | Encerramento de sessão |
| **Persistência** | Sessão mantida no localStorage |
| **Proteção de rotas** | Redirecionamento automático se não logado |

**Arquivo principal:** `src/contexts/AuthContext.tsx`

```typescript
// Exemplo de uso do contexto de autenticação
const { user, signIn, signUp, signOut, loading } = useAuth();
```

---

### 2. Gestão de Eventos (Organizador)

| Funcionalidade | Descrição |
|----------------|-----------|
| **Criar evento** | Formulário completo com validação |
| **Editar evento** | Alteração de dados do evento |
| **Excluir evento** | Remoção com confirmação |
| **Gerenciar inscrições** | Aprovar, rejeitar ou fazer check-in |
| **Exportar lista** | Download CSV de participantes |

**Arquivos principais:**
- `src/pages/CreateEvent.tsx` - Criação
- `src/pages/EditEvent.tsx` - Edição
- `src/pages/ManageEvent.tsx` - Gerenciamento

---

### 3. Participação em Eventos

| Funcionalidade | Descrição |
|----------------|-----------|
| **Listar eventos** | Home com eventos publicados |
| **Filtrar eventos** | Por data, tipo, preço |
| **Ver detalhes** | Informações completas do evento |
| **Inscrever-se** | Registro no evento |
| **Cancelar inscrição** | Remoção da inscrição |
| **Ver QR Code** | QR único para check-in |

**Arquivos principais:**
- `src/pages/Index.tsx` - Listagem
- `src/pages/EventDetails.tsx` - Detalhes
- `src/pages/Tickets.tsx` - Meus ingressos

---

### 4. Sistema de Check-in

| Funcionalidade | Descrição |
|----------------|-----------|
| **Gerar QR Code** | QR único por inscrição |
| **Ler QR Code** | Scanner via câmera |
| **Check-in manual** | Busca por código hash |
| **Contador** | Registro de múltiplos check-ins |

**Como funciona:**
1. Participante abre o QR Code no app
2. Organizador escaneia com a câmera
3. Sistema valida e registra o check-in
4. Status muda para "checked_in"

---

### 5. Perfil do Usuário

| Funcionalidade | Descrição |
|----------------|-----------|
| **Ver perfil** | Exibição de dados pessoais |
| **Editar perfil** | Nome, bio, avatar |
| **Visibilidade** | Controle de privacidade |
| **Tipo de conta** | Usuário ou Organizador |

**Arquivo principal:** `src/pages/Profile.tsx`

---

### 6. Sistema Social

| Funcionalidade | Descrição |
|----------------|-----------|
| **Ver participantes** | Lista de quem vai ao evento |
| **Enviar solicitação** | Pedido de amizade |
| **Aceitar/Recusar** | Gerenciar solicitações |
| **Lista de amigos** | Conexões aceitas |

**Regra de negócio:** Amizades só podem ser feitas entre participantes do MESMO evento, ambos com status aprovado ou checked_in.

---

## 🗄 Banco de Dados

### Diagrama ER (Entidade-Relacionamento)

```
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │     events      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ full_name       │  │    │ title           │
│ avatar_url      │  │    │ description     │
│ bio             │  │    │ start_date      │
│ role            │  │    │ end_date        │
│ visibilidade    │  │    │ location_name   │
│ created_at      │  │    │ location_url    │
└─────────────────┘  │    │ price           │
         │           │    │ is_free         │
         │           │    │ max_capacity    │
         │           │    │ requires_approval│
         │           │    │ status          │
         │           └────│ organizer_id (FK)│
         │                │ cover_image_url │
         │                │ created_at      │
         │                └────────┬────────┘
         │                         │
         │    ┌────────────────────┴────────────────────┐
         │    │                                         │
         ▼    ▼                                         ▼
┌─────────────────┐                           ┌─────────────────┐
│  registrations  │                           │   friendships   │
├─────────────────┤                           ├─────────────────┤
│ id (PK)         │                           │ id (PK)         │
│ user_id (FK)    │                           │ requester_id(FK)│
│ event_id (FK)   │                           │ receiver_id (FK)│
│ status          │                           │ event_context_id│
│ qr_code_hash    │                           │ status          │
│ checkin_count   │                           │ created_at      │
│ created_at      │                           └─────────────────┘
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│    messages     │       │     reviews     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ sender_id (FK)  │       │ event_id (FK)   │
│ receiver_id (FK)│       │ user_id (FK)    │
│ content         │       │ rating (1-5)    │
│ read            │       │ comment         │
│ created_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘

┌─────────────────┐
│  notifications  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ title           │
│ message         │
│ type            │
│ read            │
│ created_at      │
└─────────────────┘
```

### Enums (Tipos Personalizados)

```sql
-- Papel do usuário na aplicação
CREATE TYPE app_role AS ENUM ('user', 'organizer');

-- Status do evento
CREATE TYPE event_status AS ENUM ('draft', 'published', 'finished');

-- Status da inscrição
CREATE TYPE registration_status AS ENUM (
  'pending',      -- Aguardando aprovação
  'approved',     -- Aprovado
  'rejected',     -- Recusado
  'checked_in'    -- Check-in realizado
);

-- Status da amizade
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted');

-- Tipo de notificação
CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'event', 'friendship'
);
```

---

## 🔐 Autenticação e Segurança

### Row Level Security (RLS)

Todas as tabelas usam políticas RLS para garantir segurança:

```sql
-- Exemplo: Usuários só veem seus próprios dados
CREATE POLICY "Users can view own registrations"
ON public.registrations FOR SELECT
USING (auth.uid() = user_id);

-- Exemplo: Organizadores podem gerenciar seus eventos
CREATE POLICY "Organizers can update own events"
ON public.events FOR UPDATE
USING (auth.uid() = organizer_id);
```

### Políticas por Tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | Todos | Próprio | Próprio | ❌ |
| events | Publicados + Próprios | Organizador | Próprio | Próprio |
| registrations | Próprio + Organizador | Próprio | Organizador | Próprio |
| friendships | Próprio | Próprio | Receptor | ❌ |
| messages | Próprio | Próprio | ❌ | ❌ |
| reviews | Todos | Participante | Próprio | Próprio |
| notifications | Próprio | Sistema | Próprio | Próprio |

---

## 🧩 Componentes Principais

### EventCard (`src/components/events/EventCard.tsx`)

Card exibido na listagem de eventos.

**Props:**
```typescript
interface EventCardProps {
  event: {
    id: string;
    title: string;
    start_date: string;
    location_name: string;
    is_free: boolean;
    price: number;
    cover_image_url: string;
  }
}
```

**Responsabilidades:**
- Exibir imagem de capa
- Mostrar título e data
- Indicar se é gratuito ou pago
- Navegar para detalhes ao clicar

---

### TicketCard (`src/components/tickets/TicketCard.tsx`)

Card do ingresso do usuário.

**Props:**
```typescript
interface TicketCardProps {
  registration: {
    id: string;
    status: string;
    qr_code_hash: string;
    event: Event;
  }
}
```

**Responsabilidades:**
- Exibir dados do evento
- Mostrar status com cores semânticas
- Abrir modal de QR Code

---

### AuthContext (`src/contexts/AuthContext.tsx`)

Contexto global de autenticação.

**Estado:**
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email, password) => Promise<void>;
  signUp: (email, password, fullName) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Responsabilidades:**
- Gerenciar estado de autenticação
- Persistir sessão
- Fornecer métodos de auth

---

### AppLayout (`src/components/layout/AppLayout.tsx`)

Layout principal que envolve todas as páginas.

**Responsabilidades:**
- Renderizar header
- Renderizar navegação inferior
- Gerenciar área de conteúdo

---

### BottomNav (`src/components/layout/BottomNav.tsx`)

Navegação inferior mobile-first.

**Itens de navegação:**
1. 🏠 **Home** - Lista de eventos
2. 🎫 **Meus Ingressos** - Inscrições do usuário
3. ➕ **Criar Evento** - Formulário de criação
4. 👤 **Perfil** - Dados do usuário

---

## 🔄 Fluxos de Usuário

### Fluxo de Registro e Login

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Tela Auth  │────▶│  Cadastro   │────▶│   Profile   │
│   (/auth)   │     │  (signUp)   │     │  automático │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│    Login    │────▶│    Home     │
│   (signIn)  │     │   (/home)   │
└─────────────┘     └─────────────┘
```

### Fluxo de Inscrição em Evento

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Home     │────▶│  Detalhes   │────▶│  Inscrever  │
│  (eventos)  │     │  do Evento  │     │   (botão)   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┘
                    │
                    ▼
           ┌────────────────┐
           │ requires_approval?│
           └───────┬────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   Pending   │       │  Approved   │
│  (aguarda)  │       │ (automático)│
└─────────────┘       └─────────────┘
```

### Fluxo de Check-in

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Participante│────▶│  Abre QR    │────▶│  Organizador│
│ (Tickets)   │     │   Code      │     │   escaneia  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                       ┌─────────────┐
                                       │  Validação  │
                                       │  no banco   │
                                       └──────┬──────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │ checked_in  │
                                       │  (status)   │
                                       └─────────────┘
```

---

## 🎨 Estilização e Design System

### Cores Principais (CSS Variables)

```css
/* src/index.css */
:root {
  --background: 0 0% 100%;           /* Branco */
  --foreground: 240 10% 3.9%;        /* Preto */
  --primary: 262 83% 58%;            /* Violeta */
  --primary-foreground: 0 0% 100%;   /* Branco */
  --secondary: 240 4.8% 95.9%;       /* Cinza claro */
  --muted: 240 4.8% 95.9%;           /* Cinza suave */
  --accent: 240 4.8% 95.9%;          /* Destaque */
  --destructive: 0 84.2% 60.2%;      /* Vermelho */
}

.dark {
  --background: 240 10% 3.9%;        /* Preto */
  --foreground: 0 0% 98%;            /* Branco */
  /* ... outras variáveis para dark mode */
}
```

### Classes Utilitárias Customizadas

```css
/* Gradientes */
.gradient-primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
}

/* Texto com gradiente */
.text-gradient {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### Padrão de Componentes (Shadcn/UI)

Todos os componentes base seguem o padrão Shadcn:

```typescript
// Exemplo: Button
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
);
```

---

## 📱 Responsividade

O projeto é **mobile-first**, com breakpoints:

| Breakpoint | Largura | Uso |
|------------|---------|-----|
| `sm` | 640px | Smartphones landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Navegação Adaptativa

- **Mobile**: Bottom navigation (navegação inferior)
- **Desktop**: Sidebar ou top navigation (futuro)

---

## 🧪 Como Testar

### Fluxo Básico de Teste

1. **Criar conta** → Acessar `/auth` e cadastrar
2. **Criar evento** → Ir em "Criar Evento" no menu
3. **Publicar** → Mudar status para "published"
4. **Inscrever** → Com outra conta, se inscrever
5. **Check-in** → Organizador escaneia QR do participante

### Cenários de Teste

| Cenário | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Cadastro | Preencher form, submeter | Redireciona para Home |
| Login | Email + senha corretos | Acesso à aplicação |
| Criar evento | Preencher todos os campos | Evento salvo como rascunho |
| Inscrição | Clicar em "Inscrever-se" | Status pending ou approved |
| Check-in | Escanear QR válido | Status muda para checked_in |

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

---

**Desenvolvido por:** [SEU NOME]  
**Curso:** [NOME DO CURSO]  
**Instituição:** [NOME DA INSTITUIÇÃO]  
**Ano:** 2024/2025
