# Autenticação de Usuários

## O que faz

Usuários podem se registrar e fazer login. A API retorna um token JWT que deve ser enviado no cabeçalho `Authorization` para acessar funcionalidades pessoais.

## Como implementamos

### Registro (`POST /auth/register`)

```typescript
// src/services/auth.ts
const hash = await bcrypt.hash(password, 12);  // 12 rounds ~300ms
db.insert(users).values({ email, username, password: hash }).run();

const token = jwt.sign(
  { userId: user.id, email },
  JWT_SECRET,
  { expiresIn: "7d" }
);

return { id: user.id, token };
```

### Login (`POST /auth/login`)

```typescript
const user = db.select().from(users)
  .where(or(eq(users.email, emailOrUsername), eq(users.username, emailOrUsername)))
  .get();

if (!user || !(await bcrypt.compare(password, user.password))) {
  throw { status: 401, message: "Credenciais inválidas" };
}
```

### Middleware de Proteção

```typescript
// src/middleware/auth.ts — requireAuth
router.use(requireAuth);  // aplicado a todas as rotas /me/*

requireAuth:
  1. Extrai cabeçalho "Authorization: Bearer <token>"
  2. Verifica formato do token
  3. jwt.verify(token, JWT_SECRET) — valida assinatura e expiração
  4. Anexa req.user = { userId, email }
  5. Chama next()
```

## Por que deste jeito

- **bcrypt com 12 rounds**: torna inviável quebrar senhas mesmo se o banco vazar; 12 rounds é o padrão recomendado atualmente
- **JWT com 7 dias de expiração**: tokens stateless (o servidor não precisa armazenar sessão); o cliente apenas envia o token em cada requisição
- **Middleware**: a proteção é aplicada uma vez no router `/me/*` e todas as rotas abaixo ficam seguras automaticamente, sem duplicar código
- **Mensagem genérica no login**: "Credenciais inválidas" não revela se o email existe ou não, dificultando ataques de enumeração
