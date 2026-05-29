-- 1. Create Categories Table
CREATE TABLE book_categories (
	id serial4 NOT NULL,
	"name" varchar(100) NOT NULL,
	parent_id int4 NULL,
	description text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT book_categories_name_key UNIQUE (name),
	CONSTRAINT book_categories_pkey PRIMARY KEY (id),
	CONSTRAINT book_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.book_categories(id) ON DELETE SET NULL
);

-- 2. Create Publishers Table
CREATE TABLE publishers (
	id serial4 NOT NULL,
	"name" varchar(150) NOT NULL,
	website varchar(255) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT publishers_name_key UNIQUE (name),
	CONSTRAINT publishers_pkey PRIMARY KEY (id)
);

-- 3. Create Dedicated Authors Table
CREATE TABLE authors (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	bio text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	"userId" int4 NULL,
	updated_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT authors_pkey PRIMARY KEY (id),
	CONSTRAINT "FK_author_users_id" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_authors_name ON public.authors USING btree (name);

-- 4. Create Books Table (incorporating your image fields, publisher, and category)
CREATE TABLE books (
	id serial4 NOT NULL,
	title varchar(255) NOT NULL,
	isbn varchar(13) NULL,
	category_id int4 NULL,
	publisher_id int4 NULL,
	publish_year int4 NULL,
	image_url_s text NULL,
	image_url_m text NULL,
	image_url_l text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	author_id int4 NULL,
	CONSTRAINT books_isbn_key UNIQUE (isbn),
	CONSTRAINT books_pkey PRIMARY KEY (id),
	CONSTRAINT books_publish_year_check CHECK (((publish_year >= 0) AND ((publish_year)::numeric <= EXTRACT(year FROM CURRENT_DATE)))),
	CONSTRAINT books_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.book_categories(id) ON DELETE SET NULL,
	CONSTRAINT books_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(id) ON DELETE SET NULL,
	CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE SET NULL
);
CREATE INDEX idx_books_isbn ON public.books USING btree (isbn);

-- Table Triggers

create trigger update_books_modtime before
update
    on
    public.books for each row execute function update_modified_column();

-- 5. Create the Junction/Bridge Table for Many-to-Many relationship
-- This maps multiple authors to multiple books cleanly.
CREATE TABLE book_authors (
	book_id int4 NOT NULL,
	author_id int4 NOT NULL,
	CONSTRAINT book_authors_pkey PRIMARY KEY (book_id, author_id),
	CONSTRAINT book_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE,
	CONSTRAINT book_authors_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE
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

