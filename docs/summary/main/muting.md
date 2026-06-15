# Silenciamento de Palavras (Keyword Muting)

## O que faz

Usuários podem silenciar palavras-chave. Artigos cujo título ou nome da editora contenham essas palavras são ocultados do feed pessoal (`GET /me/news`).

## Como implementamos

### Gerenciamento de Palavras

```typescript
// src/services/muting.ts
async function addKeyword(userId: number, keyword: string) {
  // Verifica se já existe → 409 se duplicado
  const existing = db.select().from(userMutedKeywords)
    .where(and(
      eq(userMutedKeywords.userId, userId),
      eq(userMutedKeywords.keyword, keyword)
    ))
    .get();

  if (existing) throw { status: 409, message: "Palavra já silenciada" };

  // Insere
  db.insert(userMutedKeywords).values({ userId, keyword, createdAt }).run();
}
```

### Filtragem no Feed

```typescript
// src/services/article.ts — listArticles()
// Busca palavras do usuário
const muted = db.select().from(userMutedKeywords)
  .where(eq(userMutedKeywords.userId, userId))
  .all();

// Monta filtro SQL para cada palavra
for (const m of muted) {
  conditions.push(
    sql`${articles.title} NOT LIKE ${'%' + m.keyword + '%'}`
  );
  conditions.push(
    sql`${articles.publisher} NOT LIKE ${'%' + m.keyword + '%'}`
  );
}
```

Usamos `LIKE '%palavra%'` que corresponde a qualquer parte do texto, sem diferenciar maiúsculas de minúsculas.

## Por que deste jeito

- **Server-side**: a filtragem acontece no servidor, então o aplicativo móvel não precisa baixar artigos que serão escondidos — economia de banda e processamento
- **Privacidade**: a lista de palavras silenciadas nunca sai do servidor
- **Simplicidade**: `NOT LIKE` resolve o problema sem precisar de busca textual全文 (full-text search), que seria overengineering para este caso
- **Duplicatas com 409**: o usuário recebe feedback claro se tentar adicionar a mesma palavra duas vezes
