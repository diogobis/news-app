# Cache-Aside para Detalhes de Artigos

## O que faz

A sincronização só busca dados leves: título, editora e data. O corpo do artigo, autores e thumbnail são carregados sob demanda — apenas quando um usuário clica no artigo.

## Como implementamos

Arquivo `src/services/article.ts`, função `getArticleDetails(uuid)`:

```
Usuário clica em um artigo
  → GET /details?uuid=abc
    → SELECT body FROM articles WHERE uuid = 'abc'

  [body é null?]
  ├─ SIM (cache miss):
  │   → fetchArticleDetails(uuid) via FreeNewsApi
  │   → UPDATE articles SET body = ..., details_fetched = true
  │   → Retorna dados completos
  │
  └─ NÃO (cache hit):
      → Retorna dados do banco imediatamente
```

```
Fluxo completo:
src/routes/details.ts
  → valida UUID com Zod
  → chama getArticleDetails() do service
    → service verifica se body está no DB
      → se não: busca na API externa, persiste, retorna
      → se sim: retorna direto
  → route envia resposta JSON
```

## Por que deste jeito

- **Economia de cota da API**: o FreeNewsApi custa por requisição. Buscar detalhes de todos os artigos durante o sync seria caro e a maioria nunca seria lida
- **Resposta rápida para o usuário**: artigos já visualizados por alguém ficam em cache no SQLite, então o próximo usuário vê instantaneamente
- **Padrão consagrado**: cache-aside (ou lazy-loading) é um padrão clássico de cache: "só carregue quando precisar"
