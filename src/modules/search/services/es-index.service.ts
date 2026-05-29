import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

const INDEX_BOOKS = 'library_books';
const INDEX_AUTHORS = 'library_authors';
const INDEX_MEMBERS = 'library_members';

@Injectable()
export class EsIndexService implements OnModuleInit {
  private readonly logger = new Logger(EsIndexService.name);

  constructor(
    @Inject('ELASTICSEARCH_CLIENT')
    private readonly client: Client,
  ) {}

  async onModuleInit() {
    await this.ensureIndex(INDEX_BOOKS, {
      settings: { analysis: { analyzer: { default: { type: 'standard' } } } },
      mappings: {
        properties: {
          id: { type: 'integer' },
          title: { type: 'text' },
          isbn: { type: 'keyword' },
          authorId: { type: 'integer' },
          authorName: { type: 'text' },
          categoryId: { type: 'integer' },
          categoryName: { type: 'text' },
          publisherId: { type: 'integer' },
          publisherName: { type: 'text' },
          publishYear: { type: 'integer' },
          imageUrlS: { type: 'keyword', index: false },
          imageUrlM: { type: 'keyword', index: false },
          imageUrlL: { type: 'keyword', index: false },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
    });

    await this.ensureIndex(INDEX_AUTHORS, {
      mappings: {
        properties: {
          id: { type: 'integer' },
          name: { type: 'text' },
          email: { type: 'text' },
          bio: { type: 'text' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
    });

    await this.ensureIndex(INDEX_MEMBERS, {
      mappings: {
        properties: {
          id: { type: 'integer' },
          name: { type: 'text' },
          email: { type: 'text' },
          phone: { type: 'text' },
          address: { type: 'text' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
    });
  }

  private async ensureIndex(index: string, body: any) {
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      await this.client.indices.create({ index, body });
      this.logger.log(`Created index: ${index}`);
    }
  }

  async indexBook(doc: {
    id: number;
    title: string;
    isbn?: string;
    authorId?: number;
    authorName?: string;
    categoryId?: number;
    categoryName?: string;
    publisherId?: number;
    publisherName?: string;
    publishYear?: number;
    imageUrlS?: string;
    imageUrlM?: string;
    imageUrlL?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    await this.client.index({
      index: INDEX_BOOKS,
      id: String(doc.id),
      body: doc,
      refresh: 'wait_for',
    });
  }

  async removeBook(id: number) {
    await this.client
      .delete({ index: INDEX_BOOKS, id: String(id), refresh: 'wait_for' })
      .catch(() => {});
  }

  async indexAuthor(doc: {
    id: number;
    name?: string;
    email?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    await this.client.index({
      index: INDEX_AUTHORS,
      id: String(doc.id),
      body: doc,
      refresh: 'wait_for',
    });
  }

  async removeAuthor(id: number) {
    await this.client
      .delete({ index: INDEX_AUTHORS, id: String(id), refresh: 'wait_for' })
      .catch(() => {});
  }

  async indexMember(doc: {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    await this.client.index({
      index: INDEX_MEMBERS,
      id: String(doc.id),
      body: doc,
      refresh: 'wait_for',
    });
  }

  async removeMember(id: number) {
    await this.client
      .delete({ index: INDEX_MEMBERS, id: String(id), refresh: 'wait_for' })
      .catch(() => {});
  }

  async reindexAll(books: any[], authors: any[], members: any[]) {
    const bulkOps: any[] = [];

    for (const b of books) {
      bulkOps.push({ index: { _index: INDEX_BOOKS, _id: String(b.id) } });
      bulkOps.push(b);
    }
    for (const a of authors) {
      bulkOps.push({ index: { _index: INDEX_AUTHORS, _id: String(a.id) } });
      bulkOps.push(a);
    }
    for (const m of members) {
      bulkOps.push({ index: { _index: INDEX_MEMBERS, _id: String(m.id) } });
      bulkOps.push(m);
    }

    if (bulkOps.length > 0) {
      await this.client.bulk({ operations: bulkOps, refresh: 'wait_for' });
      this.logger.log(
        `Reindexed ${books.length} books, ${authors.length} authors, ${members.length} members`,
      );
    }
  }
}
