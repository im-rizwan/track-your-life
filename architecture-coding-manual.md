# Backend Architecture \& Coding Manual

## Track-Yr-Life Production-Grade Backend

**Version:** 1.0.0 | **Architecture:** Feature-Based Modular Monolith | **Stack:** Node.js 20 + Express + TypeScript + Prisma + PostgreSQL

***

## Document Purpose

This is the **single source of truth** for architectural decisions and development practices. All code must conform to these rules. No exceptions without documented approval.

***

# 1. System Overview

**What it is:** Production-grade REST API backend organized as a feature-based modular monolith. Single codebase, single deployment, clear module boundaries.

**Why this architecture:**

- Developer velocity over premature complexity
- Simple debugging (no distributed systems)
- Clear code organization (easy to navigate)
- Can scale to 500K+ users before needing microservices

**Current capacity:** 10M+ API requests/month, 5-15 person team

***

# 2. Core Architectural Principles

## 2.1 The Golden Rules

1. **Separation of Concerns** - Each file has one job
2. **Module Isolation** - Features are independent, communicate through types only
3. **Explicit Dependencies** - No magic, no hidden behavior
4. **Fail Fast** - Validate at entry (environment vars at startup, requests at route)
5. **Type Safety** - No `any`, no `@ts-ignore`
6. **Production-First** - Every line written for production

## 2.2 Dependency Rules (CRITICAL)

```
✅ ALLOWED:
modules/auth → core/*
modules/users → core/*
modules/users → modules/auth/types/* (types only)

❌ FORBIDDEN:
core/* → modules/*
modules/auth → modules/users (any layer)
```

**Core Rule:** Core depends on nothing. Modules depend on core and types from other modules.

## 2.3 Non-Negotiable Invariants

1. Database access only through Prisma
2. Authentication only via JWT middleware
3. Errors via `AppError` subclasses only
4. Validation at route entry (Zod schemas)
5. Secrets in environment variables
6. Logging to stdout/stderr (no files)
7. Non-root Docker user
8. Health checks < 3s response
9. API versioning via URL (`/api/v1/`)
10. Module isolation enforced via ESLint

***

# 3. Folder Structure

```
src/
├── core/              # Shared infrastructure (no business logic)
│   ├── config/        # Environment validation, Swagger config
│   ├── database/      # Prisma client, connection management
│   ├── middleware/    # Auth, validation, error handling
│   ├── errors/        # Error classes
│   ├── types/         # TypeScript augmentations
│   └── utils/         # Logger, response helpers, common schemas
├── modules/           # Feature modules (business logic)
│   ├── auth/          # Authentication
│   ├── users/         # User management
│   └── health/        # Health checks
├── api/               # API versioning
│   ├── v1/            # Version 1 routes
│   └── router.ts      # Main router
├── app.ts             # Express setup
└── server.ts          # HTTP server lifecycle
```


## 3.1 What Goes Where

| Folder | Contains | Does NOT Contain |
| :-- | :-- | :-- |
| `core/config/` | Environment validation, config objects | Business logic, queries |
| `core/database/` | Prisma client, connection logic | Actual queries |
| `core/middleware/` | Cross-cutting middleware | Business logic, module-specific logic |
| `core/errors/` | Error classes, status mappings | Business logic |
| `core/utils/` | Pure functions, logging, validation | Business logic, database access |
| `modules/*/` | Feature-specific logic | Shared utilities, other module imports |


***

# 4. Feature Module Anatomy

```
modules/feature/
├── types/
│   └── feature.types.ts    # TypeScript types (no runtime code)
├── dto/
│   └── *.dto.ts            # Zod validation schemas
├── feature.repository.ts   # Database queries (Prisma only)
├── feature.service.ts      # Business logic
├── feature.controller.ts   # HTTP request/response
└── feature.routes.ts       # Route definitions + middleware
```


## 4.1 Layer Responsibilities

| Layer | Responsibility | Can Import | Cannot Import |
| :-- | :-- | :-- | :-- |
| **Types** | Type definitions | Nothing | Anything |
| **DTOs** | Input validation (Zod) | Types, common schemas | Services, repositories |
| **Repository** | Database queries | Prisma, types | Services, controllers |
| **Service** | Business logic | Repository, errors, types | Controllers, req/res |
| **Controller** | HTTP handling | Service, DTOs, utils | Repository, Prisma |
| **Routes** | Route definitions | Controller, middleware | Services, repositories |

## 4.2 Data Flow

```
HTTP Request → Route → Middleware (validation, auth) → Controller 
→ Service (business logic) → Repository (database) 
→ Response back up the chain
```

**Rule:** Each layer calls only the layer below. No skipping.

***

# 5. Coding Standards

## 5.1 Naming Conventions

- **Files:** `kebab-case.ts` (e.g., `users.service.ts`)
- **Classes:** `PascalCase` with suffix (e.g., `UsersService`)
- **Functions:** `camelCase`, verb-first (e.g., `createUser`)
- **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRIES`)


## 5.2 TypeScript Rules

**MUST:**

- Explicit return types on all functions
- Explicit parameter types
- Strict mode enabled
- No `any` (ESLint error)
- No `@ts-ignore`

**Example:**

```typescript
// ✅ GOOD
async function getUser(id: string): Promise<User | null> { ... }

// ❌ BAD
async function getUser(id) { ... }  // No types, no return type
```


## 5.3 Error Handling

**Always throw `AppError` subclasses:**

```typescript
// ✅ GOOD
if (!user) throw new NotFoundError('User not found');

// ❌ BAD
if (!user) throw new Error('User not found');
if (!user) return null;  // Silent failure
```

**Available errors:** `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `InternalServerError`

## 5.4 Logging

**Use structured logging:**

```typescript
// ✅ GOOD
logger.info('User created', { userId, email });

// ❌ BAD
console.log('User created: ' + email);
```

**Never log:** Passwords, JWT tokens, credit cards, API keys

***

# 6. Cross-Cutting Concerns

## 6.1 Authentication (JWT)

- **Token generation:** `auth.service.ts`
- **Token verification:** `auth.middleware.ts`
- **Usage:** `router.get('/protected', authenticate, controller.method)`

**Security:**

- Access tokens: 15min expiration
- Refresh tokens: 7d, stored in database
- bcrypt for passwords (cost factor 12)
- JWT_SECRET 32+ characters


## 6.2 Validation

- **Location:** DTOs (`dto/*.dto.ts`)
- **Tool:** Zod schemas
- **Pattern:** `validate(schema)` middleware on routes
- **Never skip validation**


## 6.3 Error Handling

- **Global handler:** `core/middleware/error-handler.ts`
- **Format:** `{ success: false, error: { code, message } }`
- **Stack traces:** Development only


## 6.4 Database (Prisma)

- **All queries through repositories**
- **Connection pooling:** Use Neon's pooled connection (`pgbouncer=true`)
- **Keep-alive:** 4-minute ping for serverless databases
- **Migrations:** `npx prisma migrate dev` (local), `npx prisma migrate deploy` (production)

***

# 7. Production Readiness

## 7.1 Security Checklist

- [x] Helmet security headers
- [x] Rate limiting (100/15min global, 5/15min auth)
- [x] CORS configured
- [x] Input validation (Zod)
- [x] Password hashing (bcrypt)
- [x] JWT security
- [x] SQL injection prevention (Prisma)
- [x] Non-root Docker user
- [x] Trust proxy enabled (for Render/AWS)


## 7.2 Docker Best Practices

- Multi-stage build (builder + production)
- Alpine Linux base
- Non-root user (`nodejs:nodejs`)
- Health checks configured
- .dockerignore optimized
- Image size: ~150-200MB


## 7.3 Environment Variables

**Required:** `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`

**Optional:** `DIRECT_URL`, `CORS_ORIGIN`, `LOG_LEVEL`, `ENABLE_SWAGGER`

**Validation:** All validated at startup via Zod (fails fast if invalid)

***

# 8. Adding a New Feature (Quick Guide)

## 8.1 Checklist

1. **Update schema:** `prisma/schema.prisma`
2. **Create migration:** `npx prisma migrate dev --name add_feature`
3. **Create module folder:** `mkdir -p src/modules/feature/{types,dto}`
4. **Create files:**
    - `types/feature.types.ts` (TypeScript types)
    - `dto/*.dto.ts` (Zod schemas)
    - `feature.repository.ts` (database queries)
    - `feature.service.ts` (business logic)
    - `feature.controller.ts` (HTTP handlers)
    - `feature.routes.ts` (route definitions)
5. **Wire routes:** Add to `api/v1/index.ts`
6. **Test:** Manual testing via curl/Swagger
7. **Verify:** `npm run lint && npm run build`
8. **Commit:** `git commit -m "feat: Add feature module"`

## 8.2 File Templates

**Repository:**

```typescript
export class FeatureRepository {
  async findById(id: string): Promise<Entity | null> {
    return prisma.entity.findUnique({ where: { id } });
  }
  async create(data: CreateData): Promise<Entity> {
    return prisma.entity.create({ data });
  }
}
```

**Service:**

```typescript
export class FeatureService {
  private repository: FeatureRepository;
  constructor() { this.repository = new FeatureRepository(); }
  
  async createEntity(data: CreateData): Promise<Entity> {
    // Business validation
    const existing = await this.repository.findByEmail(data.email);
    if (existing) throw new ConflictError('Already exists');
    
    return this.repository.create(data);
  }
}
```

**Controller:**

```typescript
export class FeatureController {
  private service: FeatureService;
  constructor() { this.service = new FeatureService(); }
  
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateDto;
    const result = await this.service.createEntity(data);
    sendCreated(res, result, 'Created successfully');
  });
}
```

**Routes:**

```typescript
const router = Router();
const controller = new FeatureController();

router.post('/', authenticate, validate(createSchema), controller.create);
router.get('/:id', controller.getById);

export default router;
```


***

# 9. AI Development Rules

When using AI coding assistants (Claude Code, Copilot, etc.):

## 9.1 MUST Follow

1. **Respect module boundaries** - No cross-module service imports
2. **Use existing patterns** - Match established file structure exactly
3. **Validate all inputs** - Every endpoint needs Zod schema
4. **Type everything** - No `any`, explicit return types
5. **Follow naming conventions** - kebab-case files, PascalCase classes
6. **Use error classes** - Only `AppError` subclasses
7. **Wrap async handlers** - Always use `asyncHandler`
8. **Keep layers pure** - Business logic only in services

## 9.2 MUST NOT Do

1. Put business logic in controllers
2. Access Prisma outside repositories
3. Import services from other modules
4. Hardcode secrets or config
5. Use `console.log` (use `logger`)
6. Skip validation middleware
7. Create new architectural patterns
8. Violate dependency rules

## 9.3 Decision Tree: Where Does This Code Go?

```
Is it database access? → Repository
Is it business logic? → Service
Is it HTTP handling? → Controller
Is it request validation? → DTO
Is it shared utility? → core/utils
Is it cross-module? → Extract to core
Is it types only? → types/ folder
```


***

# 10. Final Rules Summary

## 10.1 Non-Negotiables

1. All database access through Prisma repositories
2. All errors are `AppError` subclasses
3. All inputs validated with Zod at route entry
4. All secrets in environment variables
5. All async handlers wrapped in `asyncHandler`
6. Module isolation maintained (no cross-service imports)
7. TypeScript strict mode, no `any`
8. Logging to stdout/stderr only
9. Docker runs as non-root user
10. Production mindset always

## 10.2 Common Anti-Patterns to Avoid

❌ Business logic in controllers
❌ Prisma queries in services
❌ Silent failures (returning `null` on errors)
❌ Skipping validation
❌ Cross-module service dependencies
❌ Hardcoded configuration
❌ Using `console.log`
❌ Throwing generic `Error`
❌ Accessing `process.env` directly
❌ File logging in containers

***

## Appendix: Quick Reference

**Start development:** `npm run dev`
**Build:** `npm run build`
**Lint:** `npm run lint`
**Migrate:** `npx prisma migrate dev --name description`
**Deploy migration:** `npx prisma migrate deploy`
**Generate client:** `npx prisma generate`
**Docker build:** `docker build -t app .`
**Docker run:** `docker run -p 3000:3000 --env-file .env app`

**Health check:** `GET /health`
**API docs:** `GET /api-docs`
**Metrics:** `GET /metrics`

***

**This manual is the law. Follow it.**