# VGA-ITS — Sistema Tutor Inteligente para Álgebra Linear

Sistema Tutor Inteligente (ITS) para apoio ao ensino de **Álgebra Linear** (Matrizes e Vetores).  
Utiliza IA Generativa (Llama 3 via Ollama) para tutoria adaptativa baseada no modelo do aluno.

## 🏗️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | NextJS 15, TypeScript, TailwindCSS, Shadcn/UI, React Query, Zustand |
| **Backend** | NestJS, TypeScript, Prisma ORM, SQLite |
| **IA** | Ollama + Llama 3 |
| **Infra** | Docker + Docker Compose |

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose (para execução com contêineres)

### Execução Local (Desenvolvimento)

**1. Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
npm run start:dev
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**3. Ollama (opcional — necessário para o chat com IA):**
```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec ollama ollama pull llama3
```

### Execução com Docker Compose
```bash
docker compose up --build

# Em outro terminal, baixar o modelo Llama 3:
docker compose exec ollama ollama pull llama3
```

## 📋 Funcionalidades

1. **Avaliação Diagnóstica** — Quiz com 25 questões cobrindo 11 conceitos
2. **Grafo de Conhecimento** — Visualização do progresso com cores (verde/amarelo/vermelho/cinza)
3. **Modelo do Aluno** — Rastreia domínio, exercícios e histórico por conceito
4. **Chatbot Tutor** — IA adaptativa que explica, cria exercícios e dá dicas progressivas
5. **Atualização de Mastery** — Acerto (+20%), Erro (-10%), Acerto com dica (+10%)
6. **Dashboard** — Progresso geral, estatísticas e grafo interativo

## 🗂️ Conceitos do Grafo de Conhecimento

| ID | Conceito | Categoria |
|----|----------|-----------|
| M1 | Conceitos Básicos de Matrizes | Matrizes |
| M2 | Operações com Matrizes | Matrizes |
| M3 | Determinantes | Matrizes |
| M4 | Sistemas Lineares | Matrizes |
| V1 | Conceitos Básicos de Vetores | Vetores |
| V2 | Representação Vetorial | Vetores |
| V3 | Operações com Vetores | Vetores |
| V4 | Módulo de Vetores | Vetores |
| V5 | Produto Escalar | Vetores |
| V6 | Ângulo entre Vetores | Vetores |
| V7 | Ortogonalidade | Vetores |

## 🔗 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/students` | Cadastrar aluno |
| POST | `/api/students/login` | Login |
| GET | `/api/students/:id/progress` | Progresso do aluno |
| PATCH | `/api/students/:id/mastery` | Atualizar mastery |
| POST | `/api/assessments/start` | Iniciar avaliação |
| POST | `/api/assessments/:id/answer` | Responder questão |
| POST | `/api/assessments/:id/finish` | Finalizar avaliação |
| GET | `/api/assessments/:id/result` | Resultado |
| GET | `/api/knowledge-graph/:studentId` | Grafo do aluno |
| POST | `/api/chat/sessions` | Criar sessão de chat |
| POST | `/api/chat/message` | Enviar mensagem |

## 📚 Disciplina

IA Aplicada à Educação — UFRN/IMD
