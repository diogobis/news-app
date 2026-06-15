# Melhores Práticas

Este documento destaca as práticas de engenharia usadas em toda a API. Estas são as convenções a seguir ao adicionar ou modificar código.

---

## Configuração TypeScript

O projeto usa TypeScript estrito com resolução de módulos ES2022.

### Modo Estrito

`tsconfig.json` habilita `strict: true`, que captura:
- Acesso a `null`/`undefined`
- Tipos `any` implícitos
- Parâmetros não utilizados
- Assinaturas de função incorretas

### ESM

O projeto usa ES Modules (`"type": "module"` no `package.json`). Use sintaxe `import`/`export` em todo lugar. Sem `require()`.

---

## Padrão de Tratamento de Erros

### Lançando Erros dos Services

Services lançam objetos simples com `status` e `message`:

```typescript
if (existingUser) {
  throw { status: 409, message: "Email já cadastrado" };
}
```

O middleware global de erro (`src/middleware/error.ts`) captura estes e retorna a resposta JSON apropriada. Isso mantém os services agnósticos a HTTP.

### Erros de Validação

O helper `validate()` (`src/lib/validate.ts`) encapsula o `safeParse` do Zod:

```typescript
import { z } from "zod";
import { validate } from "../lib/validate";

const schema = z.object({ email: z.string().email() });
const data = validate(schema, req.body);  // lança ValidationError em caso de falha
```

ValidationError é capturado pelo middleware de erro e retorna um `400` com uma mensagem descritiva. O tipo de retorno é inferido automaticamente a partir do schema.

### Middleware de Erro

O manipulador de erro (`src/middleware/error.ts`) encadeia três verificações:

1. É um `ValidationError`? → `400`
2. Tem `status` e `message`? → aquele código de status
3. Qualquer outra coisa? → `500` (registra o erro completo no console)

---

## Formato de Resposta Consistente

Todas as rotas usam `sendSuccess` e `sendError` de `src/lib/response.ts`:

```typescript
// Sucesso com dados
sendSuccess(res, { id: 1, name: "Teste" });

// Sucesso com paginação
sendSuccess(res, items, { page: 1, limit: 20, total: 100, totalPages: 5 });

// Erro
sendError(res, 404, "Artigo não encontrado");
```

Isso garante que toda resposta tenha o formato `{ success, data, meta? }` ou `{ success, error }`.

---

## Camadas: Routes Nunca Fazem Lógica de Negócio

Routes (em `src/routes/`) são enxutas:

- Interpretam e validam a entrada
- Chamam um service
- Enviam a resposta
- Encaminham erros para `next(err)`

Services (em `src/services/`) contêm toda a lógica de negócio.

**Bom:**

```typescript
// Na route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = validate(loginSchema, req.body);
    const result = await login(email, password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});
```

**Ruim (não faça isso):**

```typescript
// Lógica de negócio na route — NÃO FAÇA
router.post("/login", async (req, res) => {
  const user = db.select().from(users).where(eq(users.email, req.body.email)).get();
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});
```

---

## Middleware para Preocupações Transversais

### Autenticação como Middleware

O middleware `requireAuth` (`src/middleware/auth.ts`) envolve todas as rotas `/me/*`:

1. Extrai o cabeçalho `Authorization`
2. Verifica o formato do token Bearer
3. Verifica a assinatura e expiração do JWT
4. Anexa `req.user = { userId, email }` à requisição
5. Chama `next()` ou lança `401`

As rotas acessam o usuário autenticado via `req.user!.userId` (o `!` é seguro porque o middleware garante que existe).

### Montagem em um Router

```typescript
const router = Router();
router.use(requireAuth);   // protege todas as rotas abaixo
router.get("/news", ...);
router.post("/mutes", ...);
```

---

## Acesso ao Banco de Dados

### Síncrono por Design

better-sqlite3 é síncrono. Funções de service podem ser `async` (para chamadas axios ao FreeNewsApi) mas chamadas ao banco são diretas:

```typescript
const result = db.insert(schema.users).values({ ... }).run();
//                                    ^^^ .run() é síncrono, sem await
```

### Padrão Upsert

A sincronização usa `ON CONFLICT DO UPDATE` para evitar erros de chave duplicada:

```typescript
db.insert(schema.articles)
  .values({ uuid, title, publisher, publishedAt, fetchedAt })
  .onConflictDoUpdate({
    target: schema.articles.uuid,
    set: { title, publisher, publishedAt, fetchedAt },
  })
  .run();
```

### Padrão de Junção por Categoria

Artigos são vinculados a categorias através de uma tabela separada `article_categories`. A rota constrói um `INNER JOIN`:

```typescript
// Ao filtrar por categoria:
.innerJoin(schema.articleCategories,
  and(
    eq(schema.articles.uuid, schema.articleCategories.articleUuid),
    eq(schema.articleCategories.category, category)
  )
)
```

---

## Validação de Entrada na Fronteira

Toda entrada do usuário é validada com um schema Zod no nível da route — nunca dentro do service. Isso estabelece uma fronteira de confiança:

1. Route valida → dados estão limpos
2. Service recebe dados limpos e nunca re-valida

### Coerção de Parâmetros de Query

Parâmetros de query são sempre strings. Use `z.coerce.number()` para interpretá-los:

```typescript
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
```

---

## Padrões de Erro em Services

### Detecção de Duplicata

Verifica existência antes de inserir, lança `409`:

```typescript
const existing = listKeywords(userId).find(k => k.keyword === keyword);
if (existing) {
  throw { status: 409, message: "Palavra já silenciada" };
}
```

### Não Encontrado

Verifica existência antes de operar, lança `404`:

```typescript
if (!result) {
  throw { status: 404, message: "Artigo não encontrado" };
}
```

### Não Autorizado

Usado pelo service de auth — lança `401` com mensagem genérica (não revela se foi email ou senha que estava errado):

```typescript
throw { status: 401, message: "Email/username ou senha inválidos" };
```

---

## Consciência de Limite de Taxa da API

FreeNewsApi permite 2 requisições por segundo. A sincronização respeita isso com 1100ms de atraso entre requisições:

```typescript
await sleep(1100);
```

A sincronização é limitada a um máximo de 27 requisições totais (9 categorias × 3 páginas) por execução.

---

## Trabalhando com o Projeto

### Adicionando um Novo Endpoint

1. Adicione o manipulador da rota no arquivo apropriado em `src/routes/`
2. Se precisar de nova lógica de negócio, adicione uma função em `src/services/`
3. Se precisar de novas tabelas no banco, adicione-as em `src/db/schema.ts` e execute as migrações
4. Monte o router em `src/index.ts`

### Adicionando uma Nova Funcionalidade

1. Mudança de schema? Atualize `src/db/schema.ts`, execute `npm run db:generate && npm run db:migrate`
2. Lógica de negócio? Adicione/atualize um service em `src/services/`
3. Rota? Adicione ao arquivo apropriado em `src/routes/`
4. Precisa de autenticação? Adicione ao router `/me/*` existente (auto-protegido) ou use o middleware `requireAuth`

### Variáveis de Ambiente

Variáveis obrigatórias são verificadas no carregamento do módulo nos middleware e services que as usam. A aplicação lançará erro na inicialização se `JWT_SECRET` estiver faltando. Adicione novas variáveis ao `.env` e documente-as.
