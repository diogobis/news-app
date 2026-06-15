# Banco de Dados

## Tecnologia

O banco de dados é **SQLite** usando o driver `better-sqlite3`, gerenciado através do **Drizzle ORM**.

### Conexão (`src/db/index.ts`)

- Arquivo do banco: `data/news.db`
- Modo WAL habilitado (`PRAGMA journal_mode=WAL`) para performance de leitura concorrente
- Chaves estrangeiras habilitadas (`PRAGMA foreign_keys=ON`)
- A conexão é síncrona (better-sqlite3 é síncrono por design)

### Migrações

As migrações são gerenciadas pelo `drizzle-kit`. Quando você alterar `src/db/schema.ts`:

```bash
npm run db:generate   # Gera arquivos de migração em drizzle/
npm run db:migrate    # Aplica migrações pendentes em data/news.db
npm run db:studio     # Abre uma GUI para inspecionar o banco
```

## Schema

### 1. `articles`

A tabela central. Cada linha representa um artigo de notícia buscado do FreeNewsApi. Leve durante a sincronização (apenas campos básicos), corpo/autores são carregados sob demanda (lazy-load) na primeira solicitação do usuário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `uuid` | TEXT (PK) | UUID do artigo no FreeNewsApi |
| `title` | TEXT (NOT NULL) | Título do artigo |
| `publisher` | TEXT | Nome da fonte/editora |
| `published_at` | TEXT | Timestamp ISO 8601 |
| `thumbnail` | TEXT | URL da imagem de miniatura |
| `original_url` | TEXT | Link para o artigo original |
| `body` | TEXT | Texto completo do artigo (lazy-loaded) |
| `authors` | TEXT | Nome do(s) autor(es) |
| `language` | TEXT (padrão "pt-419") | Código do idioma |
| `country` | TEXT (padrão "BR") | Código do país |
| `fetched_at` | TEXT | Quando esta listagem foi sincronizada |
| `details_fetched` | INTEGER (booleano) | O corpo já foi buscado? |

**Comportamento da sincronização:** `title`, `publisher`, `published_at`, `fetched_at` são atualizados a cada sincronização se o artigo já existir (`ON CONFLICT DO UPDATE`). Outros campos permanecem inalterados.

### 2. `article_categories`

Relacionamento muitos-para-muitos entre artigos e categorias. Um artigo pode pertencer a múltiplas categorias (ex.: "technology" e "science").

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `article_uuid` | TEXT (FK → articles.uuid) | Identificador do artigo |
| `category` | TEXT | Slug da categoria |

**PK Composta:** `(article_uuid, category)`

### 3. `users`

Contas de usuário registradas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER (PK, auto-incremento) | ID do usuário |
| `email` | TEXT (UNIQUE, NOT NULL) | Email do usuário |
| `username` | TEXT (UNIQUE, NOT NULL) | Nome de exibição |
| `password` | TEXT (NOT NULL) | Hash bcrypt (12 rounds) |
| `created_at` | TEXT (NOT NULL) | Timestamp ISO 8601 |

### 4. `user_muted_keywords`

Palavras que um usuário deseja ocultar de seu feed de notícias.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER (PK, auto-incremento) | ID da entrada |
| `user_id` | INTEGER (FK → users.id, CASCADE) | Usuário que silenciou esta palavra |
| `keyword` | TEXT (NOT NULL) | A palavra silenciada |
| `created_at` | TEXT (NOT NULL) | Quando foi silenciada |

**Delete em cascata:** Se o usuário for deletado, suas palavras silenciadas são deletadas automaticamente.

### 5. `user_read_later`

Artigos salvos por um usuário para ler depois. Entradas mais antigas que 48 horas são excluídas das consultas mas permanecem no banco.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `user_id` | INTEGER (FK → users.id, CASCADE) | Usuário que salvou |
| `article_uuid` | TEXT (FK → articles.uuid, CASCADE) | Artigo salvo |
| `saved_at` | TEXT (NOT NULL) | Quando foi salvo |

**PK Composta:** `(user_id, article_uuid)` — um usuário pode salvar um artigo apenas uma vez.

**Delete em cascata:** Se o usuário ou artigo for deletado, a entrada de leitura posterior é deletada automaticamente.

## Diagrama Entidade-Relacionamento

```
articles ──────< article_categories >────── (nenhuma entidade)
  │                                              │
  │                                              │
  ▼                                              ▼
user_read_later                              (apenas tabela de junção)
  │
  │
  ▼
users ──────< user_muted_keywords
```

Relacionamentos:
- `articles` 1:N `article_categories` — cada artigo tem 1+ categorias
- `users` 1:N `user_muted_keywords` — cada usuário tem 0+ palavras silenciadas
- `users` N:N `articles` via `user_read_later` — cada usuário tem 0+ artigos salvos, cada artigo pode ser salvo por 0+ usuários

## Consultas

### Listagem pública de notícias (simplificada)

```sql
SELECT a.*, ac.category
FROM articles a
LEFT JOIN article_categories ac ON a.uuid = ac.article_uuid
WHERE a.details_fetched = false
  AND (? IS NULL OR ac.category = ?)
ORDER BY a.published_at DESC
LIMIT ? OFFSET ?
```

### Notícias filtradas com palavras silenciadas (simplificada)

```sql
SELECT a.*, ac.category
FROM articles a
LEFT JOIN article_categories ac ON a.uuid = ac.article_uuid
WHERE a.details_fetched = false
  AND (? IS NULL OR ac.category = ?)
  AND a.title NOT LIKE '%palavra1%'
  AND a.publisher NOT LIKE '%palavra1%'
  AND a.title NOT LIKE '%palavra2%'
  AND a.publisher NOT LIKE '%palavra2%'
  -- ... um par para cada palavra silenciada
ORDER BY a.published_at DESC
LIMIT ? OFFSET ?
```

### Leitura posterior com expiração de 48h

```sql
SELECT url.*, a.title, a.publisher, a.published_at, a.thumbnail
FROM user_read_later url
JOIN articles a ON url.article_uuid = a.uuid
WHERE url.user_id = ?
  AND url.saved_at >= datetime('now', '-48 hours')
ORDER BY url.saved_at DESC
```
