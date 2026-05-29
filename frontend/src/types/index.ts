export interface User {
  id: number;
  email: string;
  role: 'MEMBER' | 'AUTHOR' | 'ADMIN';
}

export interface Member {
  id: number;
  userId?: number;
  user?: User;
  name?: string;
  phone?: string;
  address?: string;
}

export interface Author {
  id: number;
  userId?: number;
  user?: User;
  name?: string;
  bio?: string;
}

export interface BookCategory {
  id: number;
  name: string;
  parent?: BookCategory;
  description?: string;
  createdAt?: string;
}

export interface Publisher {
  id: number;
  name: string;
  website?: string;
  createdAt?: string;
}

export interface BookAuthor {
  bookId: number;
  authorId: number;
  author?: Author;
}

export type ImageSizes = {
  imageUrlS?: string;
  imageUrlM?: string;
  imageUrlL?: string;
};

export interface Book {
  id: number;
  isbn: string;
  title: string;
  publishYear?: number;
  author?: Author;
  category?: BookCategory;
  publisher?: Publisher;
  bookAuthors?: BookAuthor[];
  imageUrlS?: string;
  imageUrlM?: string;
  imageUrlL?: string;
  borrowings?: Borrowing[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Borrowing {
  id: number;
  memberId: number;
  bookId: number;
  book?: Book;
  member?: Member;
  borrowDate: string;
  returnDate?: string;
}

export interface MembershipCard {
  id: number;
  memberId: number;
  issueDate: string;
  expiryDate: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    member?: { id: number };
    author?: { id: number };
  };
}

export interface PaginatedBooks {
  success: boolean;
  message: string;
  data: Book[];
  total: number;
  page: number;
  limit: number;
}
