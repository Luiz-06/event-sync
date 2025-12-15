# Event Sync

O **Event Sync** é uma plataforma moderna para gestão e sincronização de eventos. O aplicativo permite que usuários criem, editem, busquem e gerenciem ingressos para eventos, além de oferecer funcionalidades de perfil e interações sociais.

O projeto foi construído utilizando uma stack moderna focada em performance e experiência do desenvolvedor, utilizando **React**, **TypeScript** e **Vite**, com **Supabase** como backend (BaaS).

## 🚀 Tecnologias Utilizadas

Este projeto utiliza as seguintes tecnologias e bibliotecas principais:

- **[React](https://react.dev/)**: Biblioteca JavaScript para construção de interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: JavaScript com tipagem estática.
- **[Vite](https://vitejs.dev/)**: Build tool rápida para desenvolvimento frontend.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS utilitário para estilização rápida.
- **[Shadcn/ui](https://ui.shadcn.com/)**: Coleção de componentes de UI reutilizáveis (construídos sobre Radix UI).
- **[Supabase](https://supabase.com/)**: Backend as a Service (Auth, Database, Realtime).
- **[Bun](https://bun.sh/)**: Runtime JavaScript rápido e gerenciador de pacotes.
- **React Router**: Para navegação e roteamento (SPA).
- **TanStack Query (React Query)**: Para gerenciamento de estado assíncrono e cache de dados.

## ✨ Funcionalidades Principais

- **Autenticação**: Login e Cadastro de usuários (via Supabase Auth).
- **Gestão de Eventos**:
  - Criação de novos eventos.
  - Edição e gerenciamento de eventos existentes.
  - Listagem e filtros de eventos.
  - Página de detalhes do evento.
- **Sistema de Ingressos**: Visualização e gestão de tickets.
- **Perfil de Usuário**: Edição e visualização de perfil.
- **Social**: Funcionalidades de interação social.
- **Interface Responsiva**: Design adaptável para mobile e desktop, com navegação otimizada.

## 📂 Estrutura do Projeto

A estrutura de pastas segue padrões modernos de React:

```text
src/
├── components/        # Componentes reutilizáveis
│   ├── events/        # Componentes específicos de eventos (Cards, Filtros)
│   ├── layout/        # Layouts da aplicação (AppLayout, BottomNav)
│   ├── profile/       # Componentes de perfil
│   ├── tickets/       # Componentes de ingressos
│   └── ui/            # Componentes base do Shadcn (Button, Card, Input, etc.)
├── contexts/          # Contextos do React (ex: AuthContext)
├── docs/              # Documentação e Schemas do Banco de Dados
├── hooks/             # Custom Hooks (use-toast, use-mobile)
├── integrations/      # Integrações externas (Cliente Supabase)
├── lib/               # Utilitários e funções auxiliares
├── pages/             # Páginas da aplicação (rotas)
├── types/             # Definições de tipos TypeScript
└── App.tsx            # Componente raiz e rotas
