# Visão Geral da Arquitetura

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20+ |
| Linguagem | TypeScript (strict mode) |
| Framework | Express 4 |
| Banco | SQLite + better-sqlite3 |
| ORM | Drizzle ORM |
| Validação | Zod |
| Autenticação | bcrypt + JWT |

## Arquitetura em Camadas

```
Rotas (HTTP) → Services (lógica) → Banco de Dados
```

```
src/routes/       → só validam entrada e chamam services
src/services/     → lógica de negócio pura, sem saber de HTTP
src/db/           → schema e conexão
```

- **Routes nunca tocam no banco**
- **Services nunca leem req/res**

## Fluxo de uma Requisição

```
App Móvel
  │
  ▼
Express Router
  │
  ├─ Público: valida query/body com Zod
  │     ↓
  │   Service → DB Drizzle → resposta JSON
  │
  ├─ Autenticado (/me/*):
  │     ↓
  │   requireAuth (extrai e verifica JWT)
  │     ↓
  │   Service → DB → resposta JSON
  │
  ▼
Error Handler → JSON de erro padronizado
```

## Banco de Dados (SQLite)

```
articles ────< article_categories     (categorias dos artigos)
    │
    └───< user_read_later             (fila de leitura)
               │
               └─── users ────< user_muted_keywords
```

5 tabelas: `articles`, `article_categories`, `users`, `user_muted_keywords`, `user_read_later`

## Tratamento de Erros

- Services lançam `throw { status: 409, message: "..." }`
- Error middleware captura e retorna JSON padronizado
- `ValidationError` do Zod → 400
- Objetos com `status` + `message` → aquele status
- Erros não tratados → 500

## Formato de Resposta

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 342, "totalPages": 18 }
}
```
