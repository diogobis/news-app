# Endpoints da API

Todas as respostas bem-sucedidas seguem este formato:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }   // presente apenas em respostas paginadas
}
```

Respostas de erro seguem este formato:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva"
}
```

---

## Health Check

### `GET /health`

Verifica se o servidor está rodando.

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": { "status": "ok" }
}
```

---

## Endpoints Públicos

### `GET /news`

Lista artigos do banco local com paginação e filtro opcional por categoria.

**Parâmetros de Query:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `category` | string | — | Filtrar por categoria (politics, world, business, technology, science, gaming, education, travel, sports) |
| `page` | integer | 1 | Número da página (base 1) |
| `limit` | integer | 20 | Itens por página (1–50) |

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "uuid": "abc123",
      "title": "Some News Headline",
      "publisher": "Folha de S.Paulo",
      "publishedAt": "2025-06-14T10:00:00Z",
      "thumbnail": null,
      "categories": ["politics"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "totalPages": 18
  }
}
```

**Observações:**
- Retorna apenas artigos buscados pelo processo de sincronização (que têm `details_fetched = false`). O corpo completo não está disponível aqui — clientes chamam `GET /details` ao clicar.
- O filtro por categoria é aplicado como um inner join em `article_categories`. Omiti-lo retorna todas as categorias.

---

### `GET /details`

Busca detalhes completos do artigo (corpo, autores, thumbnail). Usa o padrão cache-aside: se o corpo ainda não estiver no banco local, busca do FreeNewsApi, persiste e retorna.

**Parâmetros de Query:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `uuid` | string (uuid) | obrigatório | UUID do artigo |

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": {
    "uuid": "abc123",
    "title": "Some News Headline",
    "publisher": "Folha de S.Paulo",
    "publishedAt": "2025-06-14T10:00:00Z",
    "thumbnail": "https://example.com/image.jpg",
    "originalUrl": "https://...",
    "body": "Texto completo do artigo aqui...",
    "authors": "Nome do Autor",
    "categories": ["politics"]
  }
}
```

**Respostas de Erro:**

| Status | Condição |
|--------|----------|
| `404` | UUID do artigo não encontrado |
| `400` | Formato de UUID inválido |

---

## Autenticação

### `POST /auth/register`

Cria uma nova conta.

**Corpo da Requisição:**

```json
{
  "email": "user@example.com",
  "username": "joaosilva",
  "password": "securePassword123"
}
```

**Regras de Validação:**

| Campo | Regras |
|-------|--------|
| `email` | Formato de email válido |
| `username` | 3–30 caracteres, alfanumérico + underlines |
| `password` | 6–100 caracteres |

**Resposta:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Respostas de Erro:**

| Status | Condição |
|--------|----------|
| `409` | Email ou username já cadastrado |

---

### `POST /auth/login`

Autentica com email/username + senha.

**Corpo da Requisição:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Você também pode fazer login pelo username:

```json
{
  "username": "joaosilva",
  "password": "securePassword123"
}
```

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Respostas de Erro:**

| Status | Condição |
|--------|----------|
| `401` | Credenciais inválidas |

---

## Endpoints Autenticados

Todos os endpoints `/me/*` exigem o cabeçalho `Authorization: Bearer <token>`. O token é obtido em `/auth/register` ou `/auth/login`. Tokens expiram após 7 dias.

### `GET /me/news`

Mesmo que `GET /news` mas filtra artigos cujo título ou editora correspondam a qualquer palavra silenciada pelo usuário.

**Parâmetros de Query:**

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `category` | string | — | Filtrar por categoria |
| `page` | integer | 1 | Número da página |
| `limit` | integer | 20 | Máx 50 |

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "uuid": "abc123",
      "title": "Some News Headline",
      "publisher": "Example Publisher",
      "publishedAt": "2025-06-14T10:00:00Z",
      "thumbnail": null,
      "categories": ["technology"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5
  }
}
```

**Como a filtragem por palavras funciona:**
- As palavras silenciadas do usuário são buscadas
- Um filtro SQL `NOT LIKE '%palavra%'` é aplicado em `title` e `publisher` para cada palavra
- Artigos que correspondem a QUALQUER palavra silenciada são excluídos
- A filtragem não diferencia maiúsculas de minúsculas e corresponde a substrings

---

### `POST /me/mutes`

Adiciona uma palavra para silenciar. Artigos contendo esta palavra (no título ou editora) serão ocultados de `GET /me/news`.

**Corpo da Requisição:**

```json
{
  "keyword": "eleições"
}
```

**Regras de Validação:**

| Campo | Regras |
|-------|--------|
| `keyword` | 1–100 caracteres |

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 5,
    "userId": 1,
    "keyword": "eleições",
    "createdAt": "2025-06-14T21:30:00.000Z"
  }
}
```

**Respostas de Erro:**

| Status | Condição |
|--------|----------|
| `409` | Palavra já existe para este usuário |

---

### `GET /me/mutes`

Lista todas as palavras silenciadas do usuário autenticado.

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "userId": 1,
      "keyword": "eleições",
      "createdAt": "2025-06-14T21:30:00.000Z"
    }
  ]
}
```

---

### `DELETE /me/mutes/:id`

Remove uma palavra silenciada pelo seu ID.

**Parâmetros de Caminho:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | integer | ID da palavra |

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

---

### `POST /me/read-later`

Salva um artigo na fila de leitura posterior do usuário. A fila expira entradas automaticamente após 48 horas.

**Corpo da Requisição:**

```json
{
  "articleUuid": "abc123"
}
```

**Regras de Validação:**

| Campo | Regras |
|-------|--------|
| `articleUuid` | Deve ser um UUID válido |

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `201 Created`

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "articleUuid": "abc123",
    "savedAt": "2025-06-14T21:30:00.000Z"
  }
}
```

**Respostas de Erro:**

| Status | Condição |
|--------|----------|
| `404` | UUID do artigo não encontrado no banco |
| `409` | Artigo já está na fila de leitura posterior do usuário |

---

### `GET /me/read-later`

Lista a fila de leitura posterior do usuário. Retorna apenas entradas salvas nas últimas 48 horas (entradas expiradas são excluídas automaticamente dos resultados).

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "articleUuid": "abc123",
      "savedAt": "2025-06-14T21:30:00.000Z",
      "article": {
        "title": "Some News Headline",
        "publisher": "Example Publisher",
        "publishedAt": "2025-06-14T10:00:00Z",
        "thumbnail": null
      }
    }
  ]
}
```

---

### `DELETE /me/read-later/:articleUuid`

Remove um artigo da fila de leitura posterior.

**Parâmetros de Caminho:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `articleUuid` | uuid | UUID do artigo |

**Cabeçalhos:** `Authorization: Bearer <token>`

**Resposta:** `200 OK`

```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

---

## Resumo de Tratamento de Erros

| Status | Significado |
|--------|------------|
| `200` | Sucesso |
| `201` | Criado |
| `400` | Erro de validação (formato de entrada inválido) |
| `401` | JWT ausente/expirado/inválido, ou credenciais incorretas |
| `404` | Recurso não encontrado |
| `409` | Recurso duplicado (email, username, palavra, entrada de leitura posterior) |
| `500` | Erro interno do servidor |

O manipulador global de erros (em `src/middleware/error.ts`) captura:
- `ValidationError` (lançado pelo helper `validate`) → `400`
- Objetos com propriedades `status` e `message` → aquele código de status
- Erros não tratados → `500` com mensagem genérica
