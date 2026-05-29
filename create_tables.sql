-- 1. Create Categories Table
CREATE TABLE book_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT REFERENCES book_categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Publishers Table
CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Dedicated Authors Table
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_authors_name ON authors(name);

-- 4. Create Books Table (incorporating your image fields, publisher, and category)
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(13) UNIQUE,
    category_id INT REFERENCES book_categories(id) ON DELETE SET NULL,
    publisher_id INT REFERENCES publishers(id) ON DELETE SET NULL,
    publish_year INT CHECK (publish_year >= 0 AND publish_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    image_url_s TEXT,
    image_url_m TEXT,
    image_url_l TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_books_isbn ON books(isbn);

-- 5. Create the Junction/Bridge Table for Many-to-Many relationship
-- This maps multiple authors to multiple books cleanly.
CREATE TABLE book_authors (
    book_id INT REFERENCES books(id) ON DELETE CASCADE,
    author_id INT REFERENCES authors(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE users (
	id serial4 NOT NULL,
	email varchar NOT NULL,
	"password" varchar NULL,
	"googleId" varchar NULL,
	"role" public.users_role_enum NOT NULL,
	"isProfileCompleted" bool DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id),
	CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email)
);

CREATE TABLE members (
	id serial4 NOT NULL,
	"name" varchar(100) NULL,
	phone varchar NULL,
	address varchar NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" int4 NULL,
	CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY (id),
	CONSTRAINT "REL_839756572a2c38eb5a3b563126" UNIQUE ("userId"),
	CONSTRAINT "FK_839756572a2c38eb5a3b563126e" FOREIGN KEY ("userId") REFERENCES public.users(id)
);

CREATE TABLE borrowings (
	id serial4 NOT NULL,
	"borrowDate" timestamp NOT NULL,
	"returnDate" timestamp NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"memberId" int4 NOT NULL,
	"bookId" int4 NOT NULL,
	CONSTRAINT "PK_5da0d5a9a91e8c386e1f6812db2" PRIMARY KEY (id),
	CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668" FOREIGN KEY ("bookId") REFERENCES public.books(id),
	CONSTRAINT "FK_98ce86180d96a4473a57f7f0615" FOREIGN KEY ("memberId") REFERENCES public.members(id)
);
CREATE TABLE membership_cards (
	id serial4 NOT NULL,
	"issueDate" timestamp NOT NULL,
	"expiryDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"memberId" int4 NULL,
	CONSTRAINT "PK_00bf3d007d03173a793a942fe95" PRIMARY KEY (id),
	CONSTRAINT "REL_2eb063172c5a8d1a94eb404294" UNIQUE ("memberId"),
	CONSTRAINT "FK_2eb063172c5a8d1a94eb404294d" FOREIGN KEY ("memberId") REFERENCES public.members(id)
);

