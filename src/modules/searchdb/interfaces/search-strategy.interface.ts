export interface SearchResult<T> {
  data: T[];
  meta: {
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
  };
}

export interface BookSearchQuery {
  search?: string;
  publisherId?: number;
  publishYear?: number;
  page: number;
  limit: number;
}

export interface AuthorSearchQuery {
  search?: string;
  page: number;
  limit: number;
}

export interface MemberSearchQuery {
  search?: string;
  page: number;
  limit: number;
}

export interface SearchStrategy {
  searchBooks(query: BookSearchQuery): Promise<SearchResult<any>>;
  searchAuthors(query: AuthorSearchQuery): Promise<SearchResult<any>>;
  searchMembers(query: MemberSearchQuery): Promise<SearchResult<any>>;
}
