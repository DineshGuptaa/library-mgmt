import { Injectable } from '@nestjs/common';
import { EsSearchService } from '../../search/services/es-search.service';
import {
  SearchStrategy,
  BookSearchQuery,
  AuthorSearchQuery,
  MemberSearchQuery,
  SearchResult,
} from '../interfaces/search-strategy.interface';

@Injectable()
export class ElasticsearchSearchStrategy implements SearchStrategy {
  constructor(private readonly esSearchService: EsSearchService) {}

  async searchBooks(query: BookSearchQuery): Promise<SearchResult<any>> {
    return this.esSearchService.searchBooks(query);
  }

  async searchAuthors(query: AuthorSearchQuery): Promise<SearchResult<any>> {
    return this.esSearchService.searchAuthors(query);
  }

  async searchMembers(query: MemberSearchQuery): Promise<SearchResult<any>> {
    return this.esSearchService.searchMembers(query);
  }
}
