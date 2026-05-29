import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchStrategy } from '../interfaces/search-strategy.interface';
import { DatabaseSearchStrategy } from '../strategies/database-search.strategy';
import { ElasticsearchSearchStrategy } from '../strategies/elasticsearch-search.strategy';

export type { SearchStrategy };
export const SEARCH_STRATEGY = 'SEARCH_STRATEGY';

export const searchStrategyProvider: Provider = {
  provide: SEARCH_STRATEGY,
  inject: [ConfigService, DatabaseSearchStrategy, ElasticsearchSearchStrategy],
  useFactory: (
    configService: ConfigService,
    dbStrategy: DatabaseSearchStrategy,
    esStrategy: ElasticsearchSearchStrategy,
  ): SearchStrategy => {
    const engine = configService.get<string>('SEARCH_ENGINE', 'elasticsearch');
    if (engine === 'database') {
      return dbStrategy;
    }
    return esStrategy;
  },
};
