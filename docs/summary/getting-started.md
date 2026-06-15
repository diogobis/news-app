# Primeiros Passos

## Visão Geral

Esta é uma API Node.js + TypeScript que atua como um proxy centralizado entre um aplicativo móvel de leitura de notícias e o [FreeNewsApi.io](https://freenewsapi.io). A cada hora ela busca artigos de notícias do FreeNewsApi e os armazena em um banco SQLite local. Os usuários do aplicativo móvel leem deste cache em vez de acessar a API externa diretamente.

## Início Rápido

### Pré-requisitos

- Node.js 20+
- npm

### Configuração

```bash
# 1. Navegue até o projeto
cd api

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Edite o .env — ele deve conter:
#   NEWS_API_URL=https://api.freenewsapi.io/v1
#   NEWS_API_KEY=<sua-chave>
#   JWT_SECRET=<um-segredo-aleatorio>

# 4. Gere e execute as migrações do banco de dados
npx drizzle-kit generate
npx drizzle-kit migrate

# 5. Inicie o servidor
npm run dev
```

O servidor inicia na porta 3000. Na inicialização ele executa uma sincronização inicial (busca notícias de todas as categorias) e depois ressincroniza a cada hora.

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia com hot-reload (tsx watch) |
| `npm start` | Inicia para produção |
| `npm run db:generate` | Gera migrações Drizzle após alterações no schema |
| `npm run db:migrate` | Aplica migrações pendentes |
| `npm run db:studio` | Abre o Drizzle Studio (GUI para SQLite) |

## Estrutura do Projeto

```
api/
  .env                         # Segredos (chaves de API, segredo JWT)
  data/news.db                 # Banco SQLite (criado automaticamente)
  drizzle/                     # Arquivos de migração gerados automaticamente
  src/
    index.ts                   # Bootstrap do Express + cron horário
    db/
      schema.ts                # Definições das tabelas Drizzle
      index.ts                 # Singleton de conexão com o banco
    lib/
      response.ts              # Helpers sendSuccess / sendError
      validate.ts              # Wrapper de validação Zod
      paginate.ts              # Construtor de metadados de paginação
    services/
      fetcher.ts               # Cliente HTTP FreeNewsApi
      article.ts               # Consultas de artigos + lógica cache-aside
      sync.ts                  # Orquestrador de sincronização horária
      auth.ts                  # Registro + login
      muting.ts                # CRUD de palavras silenciadas
      readLater.ts             # CRUD da fila de leitura posterior
    routes/
      news.ts                  # GET /news
      details.ts               # GET /details
      auth.ts                  # POST /auth/register, /auth/login
      me.ts                    # Endpoints específicos do usuário em /me
    middleware/
      error.ts                 # Manipulador global de erros
      auth.ts                  # Middleware de autenticação JWT
```

## Configuração (.env)

| Variável | Descrição |
|----------|-----------|
| `NEWS_API_URL` | URL base do FreeNewsApi |
| `NEWS_API_KEY` | Chave da API FreeNewsApi |
| `JWT_SECRET` | Segredo usado para assinar e verificar tokens JWT |
| `PORT` | Porta do servidor (padrão 3000) |
