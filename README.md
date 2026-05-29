# Library Management System

Full-stack library management application with **NestJS 11** (backend), **React 18 + Vite** (frontend), **PostgreSQL**, and **ELK Stack** (Elasticsearch, Logstash, Kibana).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL |
| Search | Elasticsearch 8.17 |
| Logging | Logstash + Kibana |
| Auth | JWT (access + refresh tokens), Google OAuth |
| Email | Nodemailer (SMTP) |
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| API Docs | Swagger |

---

## Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL (local or Docker)

### 1. Clone & Install

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Environment

Copy `.env.development` settings as needed. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Backend port |
| `DATABASE_*` | — | PostgreSQL connection |
| `JWT_SECRET` | — | Token signing key |
| `ES_NODE` | `https://localhost:9200` | Elasticsearch URL |
| `ES_USERNAME` | `elastic` | ES username |
| `ES_PASSWORD` | `elastic` | ES password |
| `CORS_ORIGINS` | — | Comma-separated allowed origins |

### 3. Start ELK Stack

```bash
docker compose up -d
```

### 4. Start Backend

```bash
npm run start:dev
```

### 5. Start Frontend

```bash
cd frontend && npm run dev
```

### 6. Reindex Existing Data into Elasticsearch

```bash
curl -X POST http://localhost:3001/api/v1/search/reindex \
  -H "Authorization: Bearer <admin_token>"
```

### 7. Access

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:3001` |
| Swagger Docs | `http://localhost:3001/api` |
| Frontend | `http://localhost:5173` |
| Kibana | `http://localhost:5601` |
| Elasticsearch | `http://localhost:9200` |

---

## API Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Health check |

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/member/register` | Public | Register/login member (email + password), auto-creates profile + membership card |
| POST | `/auth/member/register/google` | Public | Register/login member via Google OAuth |
| POST | `/auth/author/register` | Public | Register/login author (email + password), auto-creates profile |
| POST | `/auth/author/register/google` | Public | Register/login author via Google OAuth |
| POST | `/auth/admin/login` | Public | Admin login |
| POST | `/auth/logout` | JWT | Logout, clear tokens |

### Books — `/api/v1/books`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/books` | Public | List with pagination, search, filters |
| GET | `/books/:id` | Public | Get by ID |
| POST | `/books` | AUTHOR, ADMIN | Create book |
| PATCH | `/books/:id` | ADMIN | Update book |
| DELETE | `/books/:id` | ADMIN | Delete book |
| GET | `/book-categories` | Public | List categories |
| GET | `/publishers` | Public | List publishers |

**Search params:** `?search=keyword&publisherId=1&publishYear=2024&page=1&limit=10`

### Authors — `/api/v1/authors`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/authors` | Public | List with pagination and search |
| GET | `/authors/:id` | Public | Get by ID |
| PATCH | `/authors/:id` | ADMIN | Update |
| DELETE | `/authors/:id` | ADMIN | Delete (also removes user) |

### Members — `/api/v1/members`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/members` | ADMIN, MEMBER | List with pagination and search |
| GET | `/members/me` | MEMBER | Current profile |
| GET | `/members/:id` | MEMBER | Get by ID |
| POST | `/members` | ADMIN | Create member (default password: `password123`) |
| PATCH | `/members/:id` | ADMIN | Update |
| DELETE | `/members/:id` | ADMIN | Delete (also removes user) |

### Borrowing — `/api/v1/borrowings`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/borrowings` | MEMBER | Borrow a book (valid card required, max 5 active, book not already borrowed) |
| GET | `/borrowings/member/:memberId` | MEMBER | List member's borrowings |
| PATCH | `/borrowings/:id/return` | MEMBER | Return a book |

### Admin — `/api/v1/admin`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/authors` | ADMIN | Create author account (sends welcome email) |

### Search — `/api/v1/search`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/search/reindex` | ADMIN | Bulk reindex all data into Elasticsearch |

### Other

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/:id` | Public | Get user by ID |
| GET | `/api/v1/membership-cards/member/:memberId` | Public | Get card by member ID |

---

## Response Format

All endpoints return a consistent structure:

```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [ ... ],
  "meta": {
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "currentPage": 1
  }
}
```

---

## Elasticsearch / ELK Stack

### Architecture

```
App (NestJS)
  ├── EsIndexService ──► Elasticsearch (9200)    ← search data (books, authors, members)
  ├── ElkLogger ───────► Logstash (5000)          ← app logs
  └── Console ─────────► stdout                   ← console output

Kibana (5601) ────────► Elasticsearch              ← visualization
```

### Indices (auto-created on startup)

| Index | Content | Fields |
|-------|---------|--------|
| `library_books` | Books | title, isbn, author, publisher, category, publishYear |
| `library_authors` | Authors | name, email, bio |
| `library_members` | Members | name, email, phone, address |

### Search Behavior

- When `?search=` param is present → queries Elasticsearch with `multi_match` + fuzziness
- When only `page`/`limit` params → queries PostgreSQL directly (faster for plain listing)
- Filters (`publisherId`, `publishYear`) also trigger ES path

### Log Shipping

The `ElkLogger` (used as NestJS application logger) sends JSON logs to Logstash via TCP port 5000. Visible in Kibana under `library-logs-*` index pattern.

---

## Database Schema

### Entities & Relationships

```
User ──1:1──► Member ──1:1──► MembershipCard
 │                │
 │                └──1:N──► Borrowing
 │                              │
 └──1:1──► Author               │
               │                │
               └──M:N──► Book ◄┘
                           │
                     M:1 ──┼── BookCategory
                           └── Publisher
```

### Tables

| Table | Key Columns |
|-------|------------|
| `users` | id, email, password (hashed), googleId, role (MEMBER/AUTHOR/ADMIN) |
| `members` | id, userId (FK), name, phone, address |
| `authors` | id, userId (FK), name, bio |
| `books` | id, title, isbn (unique), categoryId, publisherId, authorId, publishYear |
| `book_authors` | bookId + authorId (composite PK, junction) |
| `book_categories` | id, name, parentId (self-ref), description |
| `publishers` | id, name, website |
| `membership_cards` | id, memberId (unique), issueDate, expiryDate |
| `borrowings` | id, memberId, bookId, borrowDate, returnDate |

See `create_tables.sql` for full DDL and `ERD-Diagrams/` for visual schema.

---

## Authentication

### Flow
1. Register/Login → returns JWT access token (15m) + refresh token (7d)
2. Tokens returned in response body AND HTTP cookies
3. Frontend stores tokens in localStorage, sends via `Authorization: Bearer` header
4. Global guards enforce auth: `AuthenticationGuard` + `RolesGuard`

### Roles
- `MEMBER` — can browse, borrow, return books; view own profile
- `AUTHOR` — can add books (auto-assigned)
- `ADMIN` — full CRUD on all entities, can create members/authors

### Google OAuth
- Frontend obtains Google ID token
- Sends to `POST .../register/google` with desired role
- Backend verifies via `google-auth-library`
- Creates or finds user, returns JWT tokens

---

## Frontend

### Tech
- React 18, Vite 6, TypeScript
- React Router DOM v6 (BrowserRouter)
- Axios with interceptors (auto-attaches token, handles 401)
- Tailwind CSS 3

### Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/books` | Books | Public |
| `/books/:id` | BookDetail | Public |
| `/authors` | Authors | Public |
| `/authors/:id` | AuthorDetail | Public |
| `/search` | SearchResults | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | Authenticated |
| `/profile` | Profile | Authenticated |
| `/admin` | AdminDashboard | ADMIN |
| `/admin/books` | AdminBooks | ADMIN |
| `/admin/members` | AdminMembers | ADMIN |
| `/admin/authors` | AdminAddAuthor | ADMIN |

### Configuration
- API base URL: `VITE_API_URL` env or `/api/v1` (proxied in dev)
- Dev proxy (`vite.config.ts`): `/api` → `http://localhost:3001`
- Allowed ngrok: `'.ngrok-free.app'`

---

## CORS

Configured in `src/main.ts`. Origins from `CORS_ORIGINS` env var (comma-separated) or defaults:

```
http://localhost:3000, http://localhost:3001, http://localhost:5173,
http://127.0.0.1:3000, http://127.0.0.1:3001
```

Credentials: `true`. Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.

---

## Scripts

### Backend (`package.json`)

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run start:dev` | Watch mode dev server |
| `npm run start:prod` | Run compiled version |
| `npm run lint` | ESLint fix |
| `npm test` | Jest tests |

### Frontend (`frontend/package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

### Docker

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start ELK stack |
| `docker compose down` | Stop ELK stack |

---

## Project Structure

```
├── src/
│   ├── main.ts                    # Entry point (CORS, logger, Swagger, validation)
│   ├── app.module.ts              # Root module
│   ├── config/                    # Config registrations (app, db, es, jwt)
│   ├── common/                    # Shared (pagination, DTOs, interfaces, enums, ELK logger)
│   └── modules/
│       ├── auth/                  # JWT, guards, decorators, Google OAuth
│       ├── users/                 # User CRUD, providers
│       ├── member/                # Member CRUD + ES indexing
│       ├── author/                # Author CRUD + ES indexing
│       ├── book/                  # Book CRUD + ES search
│       ├── borrowing/             # Borrow/return logic
│       ├── membership-card/       # Card lookup
│       ├── admin/                 # Admin operations
│       ├── email/                 # Nodemailer
│       └── search/                # Elasticsearch module (index, search, reindex)
├── frontend/
│   └── src/
│       ├── api/client.ts          # Axios instance
│       ├── context/AuthContext.tsx # Auth state management
│       └── pages/                 # Route components
├── logstash/pipeline/             # Logstash config
├── docker-compose.yml             # ELK stack
├── create_tables.sql              # DB DDL
└── ERD-Diagrams/                  # Visual schema
```

---

## License

MIT
