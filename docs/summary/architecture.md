# Arquitetura

## Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Runtime | Node.js 20+ | LTS, estável, amplamente suportado |
| Linguagem | TypeScript (strict mode, ES2022) | Segurança de tipos, melhor refatoração |
| Framework | Express 4 | Mínimo, bem conhecido, suficiente para uma API de servidor único |
| Banco de Dados | SQLite via better-sqlite3 | Zero configuração, baseado em arquivo, sem necessidade de servidor |
| ORM | Drizzle ORM | Leve, type-safe, sintaxe semelhante a SQL |
| Validação | Zod | Validação baseada em schema com tipos TypeScript inferidos automaticamente |
| Autenticação | bcrypt + jsonwebtoken | Padrão da indústria, 12 rounds bcrypt, HS256 |
| Cliente HTTP | axios | API limpa, suporte a timeout, amigável para interceptadores |

## Padrões de Design

### Arquitetura em Camadas

```
Routes (concerns HTTP) → Services (lógica de negócio) → Database (acesso a dados)
```

- **Routes** (`src/routes/`): Interpretam a requisição, chamam `validate()`, chamam um service, chamam `sendSuccess()`, encaminham erros para `next()`.
- **Services** (`src/services/`): Lógica de negócio pura. Sem conhecimento HTTP. Lançam objetos `{ status, message }` para erros.
- **Database** (`src/db/`): Definições de schema e conexão. Consultas são escritas em Drizzle ou SQL puro dentro dos services.

Routes nunca tocam no banco diretamente. Services nunca leem `req` ou `res`.

### Padrão Cache-Aside (Detalhes de Artigos)

A sincronização de artigos busca apenas listagens (título, editora, data). O corpo completo, autores e thumbnail são caros para solicitar do FreeNewsApi. O cache-aside resolve isso:

1. Cliente solicita `GET /details?uuid=abc`
2. Service verifica o banco local — `article.body` existe?
3. **Cache hit:** Retorna o corpo armazenado imediatamente
4. **Cache miss:** Busca do FreeNewsApi, persiste no banco, retorna o resultado

Isso preserva a cota do FreeNewsApi — a API é chamada para detalhes apenas sob demanda real do usuário.

```
Clique do usuário → GET /details?uuid=abc
  → Consulta DB em articles: body IS NULL?
    → Sim: GET https://api.freenewsapi.io/v1/details?uuid=abc
      → UPDATE articles SET body=..., thumbnail=..., authors=..., details_fetched=true
      → Retorna dados
    → Não: Retorna dados diretamente do DB
```

### Camada de Validação

A validação de entrada é centralizada através de uma função `validate()` em `src/lib/validate.ts`:

```typescript
const params = validate(myZodSchema, req.query);
```

Isso encapsula o `safeParse` do Zod, lança um `ValidationError` (que o middleware de erro captura e retorna como 400), e infere automaticamente o tipo de retorno.

### Formato de Resposta Unificado

Todos os endpoints usam `sendSuccess(res, data, meta?)` de `src/lib/response.ts`. Isso garante um envelope JSON consistente:

```json
{ "success": true, "data": ..., "meta": ... }
```

Erros passam por `sendError(res, status, message)`. O middleware global de erro captura qualquer erro não tratado.

## Fluxo de Informação

### Fluxo de Dados: Ciclo de Vida Completo da Requisição

```
Aplicativo Móvel
  │
  ▼
Express Router (src/routes/)
  │─ GET /health → JSON imediato
  │
  │─ Público: valida query/params com Zod
  │     │
  │     ▼
  │   Service (src/services/)
  │     │─ Verifica condições (existe? duplicado?)
  │     │─ Consulta DB via Drizzle
  │     │─ Chama FreeNewsApi se necessário (details)
  │     ▼
  │   Helper de resposta → JSON
  │
  │─ Autenticado (/me/*):
  │     │
  │     ▼
  │   Middleware requireAuth
  │     │─ Extrai token Bearer
  │     │─ Verifica assinatura JWT + expiração
  │     │─ Anexa req.user = { userId, email }
  │     │─ Passa para o manipulador da rota
  │     ▼
  │   Mesmo fluxo do público
  │
  ▼
Middleware de erro captura qualquer coisa lançada via next(err)
```

### Fluxo de Dados: Sincronização Horária

```
setInterval (60 min)
  │
  ▼
syncAll() (src/services/sync.ts)
  │
  ├─ Para cada uma das 9 categorias:
  │     │
  │     ├─ fetchNewsList(category, "pt-419", "BR")
  │     │     ▼
  │     │   axios.get(NEWS_API_URL + "/news?topic=...")
  │     │     ▼
  │     │   Retorna { data: [articles], meta: { next_cursor } }
  │     │
  │     ├─ INSERT/upsert cada artigo em `articles`
  │     ├─ INSERT mapeamento artigo <-> categoria em `article_categories`
  │     │
  │     └─ Se next_cursor existe e página < 3:
  │          └─ sleep(1100ms) → busca próxima página
  │
  └─ Máximo: 9 categorias × 3 páginas = 27 chamadas de API por sincronização
```

### Fluxo de Dados: Registro de Usuário

```
POST /auth/register
  │
  ├─ Zod valida { email, username, password }
  │
  ├─ Verifica se email ou username já existe → 409 se sim
  │
  ├─ bcrypt.hash(password, 12) — leva ~300ms
  │
  ├─ INSERT na tabela `users`
  │
  ├─ jwt.sign({ userId: id, email }, JWT_SECRET, { expiresIn: "7d" })
  │
  └─ Retorna { id, token }
```

## Decisões Arquiteturais Chave

### 1. Por que SQLite em vez de PostgreSQL?

Esta API roda em uma única máquina (ou sidecar de aplicativo móvel). SQLite com modo WAL fornece leituras concorrentes e taxa de transferência de escrita suficiente. Zero configuração, zero custo operacional.

### 2. Por que sincronização em vez de busca sob demanda?

FreeNewsApi tem um limite de 2 req/segundo e custa por requisição. Sincronizar a cada hora agrupa todas as buscas em uma janela controlada, mantém o banco atualizado para todos os usuários e evita atingir limites de taxa durante picos de uso.

### 3. Por que filtragem de palavras no servidor (e não no cliente)?

A filtragem no servidor significa que o aplicativo móvel não precisa baixar artigos silenciados apenas para ocultá-los. Isso economiza largura de banda e mantém a lista de silêncio do usuário privada no servidor.

### 4. Por que expiração de 48h no read-later sem um cron job?

A consulta de read-later inclui `WHERE savedAt >= datetime('now', '-48 hours')'. Linhas expiradas permanecem no banco mas são invisíveis nos resultados. Isso evita um job em background enquanto mantém a funcionalidade simples. (Desvantagem: linhas órfãs acumulam lentamente, mas a custo de armazenamento desprezível.)

### 5. Por que nenhum conjunto de testes ainda?

O projeto está em desenvolvimento inicial. A dependência `vitest` está no `package.json` e pode ser usada conforme testes forem adicionados.
