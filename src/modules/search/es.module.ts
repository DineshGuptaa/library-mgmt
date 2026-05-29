import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '@elastic/elasticsearch';
import esConfig from '../../config/es.config';
import { Book } from '../book/entities/book.entity';
import { Author } from '../author/entities/author.entity';
import { Member } from '../member/entities/member.entity';
import { EsIndexService } from './services/es-index.service';
import { EsSearchService } from './services/es-search.service';
import { ReindexController } from './reindex.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Author, Member]),
    ConfigModule.forFeature(esConfig),
  ],
  controllers: [ReindexController],
  providers: [
    {
      provide: 'ELASTICSEARCH_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const esSettings = configService.get('elasticsearch');
        return new Client({
          node: esSettings.node,
          auth: esSettings.auth,
          tls: esSettings.tls,
          maxRetries: esSettings.maxRetries,
          requestTimeout: esSettings.requestTimeout,
        });
      },
    },
    EsIndexService,
    EsSearchService,
  ],
  exports: ['ELASTICSEARCH_CLIENT', EsIndexService, EsSearchService],
})
export class SearchModule {}
