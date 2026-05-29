import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

const INDEX_BOOKS = 'library_books';
const INDEX_AUTHORS = 'library_authors';
const INDEX_MEMBERS = 'library_members';

@Injectable()
export class EsSearchService {
  constructor(
    @Inject('ELASTICSEARCH_CLIENT')
    private readonly client: Client,
  ) {}

  async searchBooks(query: {
    search?: string;
    publisherId?: number;
    publishYear?: number;
    page: number;
    limit: number;
  }) {
    const must: any[] = [];

    if (query.search) {
      must.push({
        multi_match: {
          query: query.search,
          fields: ['title^3', 'isbn', 'authorName^2', 'publisherName^2', 'categoryName'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    if (query.publisherId) {
      must.push({ term: { publisherId: query.publisherId } });
    }

    if (query.publishYear) {
      must.push({ term: { publishYear: query.publishYear } });
    }

    const filter = must.length > 0 ? { bool: { must } } : { match_all: {} };
    const from = (query.page - 1) * query.limit;

    const result = await this.client.search({
      index: INDEX_BOOKS,
      body: {
        query: filter,
        sort: [{ createdAt: { order: 'desc' } }],
        from,
        size: query.limit,
      },
    });

    const hits = result.hits.hits;
    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value ?? 0;

    return {
      data: hits.map((h: any) => {
        const src = h._source;
        return {
          id: src.id,
          title: src.title,
          isbn: src.isbn,
          publishYear: src.publishYear,
          author: src.authorId ? { id: src.authorId, name: src.authorName } : null,
          category: src.categoryId ? { id: src.categoryId, name: src.categoryName } : null,
          publisher: src.publisherId ? { id: src.publisherId, name: src.publisherName } : null,
          imageUrlS: src.imageUrlS,
          imageUrlM: src.imageUrlM,
          imageUrlL: src.imageUrlL,
          createdAt: src.createdAt,
          updatedAt: src.updatedAt,
        };
      }),
      meta: {
        totalPages: Math.ceil(total / query.limit),
        totalItems: total,
        itemsPerPage: query.limit,
        currentPage: query.page,
      },
    };
  }

  async searchAuthors(query: { search?: string; page: number; limit: number }) {
    const must: any[] = [];

    if (query.search) {
      must.push({
        multi_match: {
          query: query.search,
          fields: ['name^3', 'email^2', 'bio'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    const filter = must.length > 0 ? { bool: { must } } : { match_all: {} };
    const from = (query.page - 1) * query.limit;

    const result = await this.client.search({
      index: INDEX_AUTHORS,
      body: {
        query: filter,
        sort: [{ createdAt: { order: 'desc' } }],
        from,
        size: query.limit,
      },
    });

    const hits = result.hits.hits;
    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value ?? 0;

    return {
      data: hits.map((h: any) => h._source),
      meta: {
        totalPages: Math.ceil(total / query.limit),
        totalItems: total,
        itemsPerPage: query.limit,
        currentPage: query.page,
      },
    };
  }

  async searchMembers(query: { search?: string; page: number; limit: number }) {
    const must: any[] = [];

    if (query.search) {
      must.push({
        multi_match: {
          query: query.search,
          fields: ['name^3', 'email^2', 'phone', 'address'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    const filter = must.length > 0 ? { bool: { must } } : { match_all: {} };
    const from = (query.page - 1) * query.limit;

    const result = await this.client.search({
      index: INDEX_MEMBERS,
      body: {
        query: filter,
        sort: [{ createdAt: { order: 'desc' } }],
        from,
        size: query.limit,
      },
    });

    const hits = result.hits.hits;
    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value ?? 0;

    return {
      data: hits.map((h: any) => h._source),
      meta: {
        totalPages: Math.ceil(total / query.limit),
        totalItems: total,
        itemsPerPage: query.limit,
        currentPage: query.page,
      },
    };
  }
}
