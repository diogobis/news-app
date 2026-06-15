# Sincronização de Notícias

## O que faz

A cada hora, a API busca artigos de 9 categorias diferentes do FreeNewsApi.io e armazena em um banco SQLite local. Os usuários leem deste cache, sem bater na API externa diretamente.

## Como implementamos

O arquivo `src/services/sync.ts` contém a função `syncAll()`:

```typescript
const CATEGORIES = [
  "politics", "world", "business", "technology",
  "science", "gaming", "education", "travel", "sports",
];
```

Para cada categoria, a função faz até 3 requisições paginadas usando `next_cursor`. Cada lote de artigos é inserido com `ON CONFLICT DO UPDATE` — se o artigo já existe, atualizamos título e editora; se é novo, inserimos.

```
syncAll() → para cada categoria (9) →
  fetchNewsList(category, "pt-419", "BR", cursor)
    ↓
  axios.get(NEWS_API_URL + "/news")
    ↓
  INSERT OR UPDATE em articles + INSERT em article_categories
    ↓
  sleep(1100ms) → próxima página (máx 3)
```

A taxa de 1 requisição a cada 1.1s respeita o limite de 2 req/s do FreeNewsApi.

## Por que deste jeito

- **Cache centralizado**: em vez de cada usuário buscar notícias direto do FreeNewsApi (gastando a cota da API), o servidor faz isso uma vez e todos se beneficiam
- **Sincronização horária**: as notícias não mudam a cada segundo, então 1h é um intervalo razoável
- **Bounded (limitado)**: máximo de 27 chamadas por sincronização (9 categorias × 3 páginas), evitando loops infinitos
- **Idempotente**: rodar o sync múltiplas vezes não duplica dados graças ao upsert
