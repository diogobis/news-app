# Fila de Leitura Posterior (Read-Later)

## O que faz

Usuários podem salvar artigos para ler depois. Os itens expiram automaticamente após 48 horas.

## Como implementamos

### Salvar e Remover

```typescript
// src/services/readLater.ts
async function saveArticle(userId: number, articleUuid: string) {
  // Verifica se artigo existe
  const article = db.select().from(articles)
    .where(eq(articles.uuid, articleUuid)).get();
  if (!article) throw { status: 404, message: "Artigo não encontrado" };

  // Verifica se já está na fila → 409
  const existing = db.select().from(userReadLater)
    .where(and(
      eq(userReadLater.userId, userId),
      eq(userReadLater.articleUuid, articleUuid)
    )).get();
  if (existing) throw { status: 409, message: "Artigo já salvo" };

  // Insere
  db.insert(userReadLater).values({ userId, articleUuid, savedAt }).run();
}
```

### Listagem com Expiração de 48h

```typescript
const items = db.select({
  userId: userReadLater.userId,
  articleUuid: userReadLater.articleUuid,
  savedAt: userReadLater.savedAt,
  title: articles.title,
  publisher: articles.publisher,
  publishedAt: articles.publishedAt,
  thumbnail: articles.thumbnail,
})
.from(userReadLater)
.innerJoin(articles, eq(userReadLater.articleUuid, articles.uuid))
.where(
  and(
    eq(userReadLater.userId, userId),
    // Filtro de expiração — apenas últimas 48h
    gte(userReadLater.savedAt, sql`datetime('now', '-48 hours')`)
  )
)
.orderBy(desc(userReadLater.savedAt))
.all();
```

## Por que deste jeito

- **Expiração sem cron job**: a expiração de 48h é feita com um simples `WHERE savedAt >= datetime('now', '-48 hours')`. Não precisamos de um job agendado para limpar registros antigos — eles simplesmente não aparecem nos resultados
- **Chave composta**: `(user_id, article_uuid)` como PK primária garante que um usuário não pode salvar o mesmo artigo duas vezes
- **Cascade delete**: se o artigo for removido da base (ex.: caiu do sync), a entrada na fila é deletada automaticamente pelas chaves estrangeiras com `ON DELETE CASCADE`
- **Trade-off**: registros expirados acumulam no banco, mas o volume é insignificante (cada entrada ocupa ~100 bytes)
