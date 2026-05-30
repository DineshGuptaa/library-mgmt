# Library Management System

Full-stack library management application with **NestJS 11** (backend), **React 18 + Vite** (frontend), **PostgreSQL**, and **ELK Stack** (Elasticsearch, Logstash, Kibana).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeScript |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL |
| Search | Elasticsearch 8.17 **or** PostgreSQL ILIKE (configurable) |
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
| `SEARCH_ENGINE` | `elasticsearch` | Search backend: `elasticsearch` or `database` |
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

## Sample Data (CSV Import)

Sample data CSV files are located in `sample_data/`. Import them **in the order below** to respect foreign-key constraints.

### Import Order

| Step | Table | Depends On | File |
|------|-------|------------|------|
| 1 | `users` | — | `users_202605302038.csv` |
| 2 | `book_categories` | — | `book_categories_202605302040.csv` |
| 3 | `publishers` | — | `publishers_202605302039.csv` |
| 4 | `authors` | `users.id` | `authors_202605302040.csv` |
| 5 | `members` | `users.id` | `members_202605302039.csv` |
| 6 | `books` | `book_categories.id`, `publishers.id`, `authors.id` | `books_202605302040.csv` |
| 7 | `membership_cards` | `members.id` | `membership_cards_202605302039.csv` |
| 8 | `book_authors` | `books.id`, `authors.id` | `book_authors_202605302040.csv` |
| 9 | `borrowings` | `members.id`, `books.id` | `borrowings_202605302040.csv` |

### Using `psql` (recommended)

```bash
# Replace placeholders with your actual DB name, user, and CSV paths
DB=library_management
USER=postgres
CSV_DIR=sample_data

psql -d $DB -U $USER -c "\copy users FROM '$CSV_DIR/users_202605302038.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy book_categories FROM '$CSV_DIR/book_categories_202605302040.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy publishers FROM '$CSV_DIR/publishers_202605302039.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy authors FROM '$CSV_DIR/authors_202605302040.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy members FROM '$CSV_DIR/members_202605302039.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy books FROM '$CSV_DIR/books_202605302040.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy membership_cards FROM '$CSV_DIR/membership_cards_202605302039.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy book_authors FROM '$CSV_DIR/book_authors_202605302040.csv' DELIMITER ',' CSV HEADER;"
psql -d $DB -U $USER -c "\copy borrowings FROM '$CSV_DIR/borrowings_202605302040.csv' DELIMITER ',' CSV HEADER;"
```

### Using pgAdmin

1. Open **pgAdmin** → right-click your database → **Query Tool**
2. For each table (in the order above), right-click the table → **Import/Export**
3. Set **Import** → choose the CSV file → **Format: csv** → **Header: Yes** → **Delimiter: `,`**
4. Click **OK**

### ⚠️ Important Notes

- Always import in the specified order — reversing it causes foreign-key violations.
- All sample users use password: `password123`.
- Test accounts:
  - `john.doe@email.com` (MEMBER) — has 2 books currently borrowed
  - `jane.smith@email.com` (MEMBER) — has 1 book currently borrowed
  - `bob.wilson@email.com` (MEMBER) — profile not completed, no active borrowings
  - `george.rrmartin@email.com` (AUTHOR) — 5 books
  - `jk.rowling@email.com` (AUTHOR) — 7 books

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

## Search Strategy (Configurable)

The search backend is **pluggable** — switch between Elasticsearch and PostgreSQL via the `SEARCH_ENGINE` env var without changing any code.

### Architecture

```
BookService / AuthorService / MemberService
          │
          ▼
    @Inject(SEARCH_STRATEGY)
          │
          ▼
  SearchStrategy (interface)
     ▲           ▲
     │           │
DatabaseSearch    ElasticsearchSearch
(ILIKE queries)   (delegates to EsSearchService)
```

### How it works

- When `?search=` or filters (`publisherId`, `publishYear`) are present → delegates to the configured `SearchStrategy`
- When only `page`/`limit` params → queries PostgreSQL directly (always uses DB for plain listing)
- The strategy is selected once at startup based on `SEARCH_ENGINE` env var

### Database Search (ILIKE)

When `SEARCH_ENGINE=database`, search uses PostgreSQL `ILIKE` with wildcards:

| Entity | Fields searched |
|--------|----------------|
| Books | `title`, `isbn`, `publisher.name` |
| Authors | `name`, `bio`, `user.email` |
| Members | `name`, `user.email`, `phone` |

Also supports exact filters: `publisherId`, `publishYear`.

### Elasticsearch Search

When `SEARCH_ENGINE=elasticsearch` (default), search uses Elasticsearch with `multi_match` + fuzziness `AUTO`:

| Entity | Fields searched (boosted) |
|--------|--------------------------|
| Books | `title^3`, `isbn`, `authorName^2`, `publisherName^2`, `categoryName` |
| Authors | `name^3`, `email^2`, `bio` |
| Members | `name^3`, `email^2`, `phone`, `address` |

### ELK Stack

```
App (NestJS)
  ├── SearchStrategy ──► Elasticsearch (9200)    ← search data (books, authors, members)
  ├── EsIndexService ──► Elasticsearch (9200)    ← auto-index on create/update/delete
  ├── ElkLogger ───────► Logstash (5000)          ← app logs
  └── Console ─────────► stdout                   ← console output

Kibana (5601) ────────► Elasticsearch              ← visualization
```

### Elasticsearch Indices (auto-created on startup)

| Index | Content | Fields |
|-------|---------|--------|
| `library_books` | Books | id, title, isbn, authorId, authorName, categoryId, categoryName, publisherId, publisherName, publishYear, imageUrlS/M/L, createdAt, updatedAt |
| `library_authors` | Authors | id, name, email, bio, createdAt, updatedAt |
| `library_members` | Members | id, name, email, phone, address, createdAt, updatedAt |

### Reindex

```bash
# Bulk sync all existing DB data into Elasticsearch
curl -X POST http://localhost:3001/api/v1/search/reindex \
  -H "Authorization: Bearer <admin_token>"
```

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
│       ├── search/                # Elasticsearch client, index, search, reindex
│       └── searchdb/              # Pluggable search strategy (ES or DB ILIKE)
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
