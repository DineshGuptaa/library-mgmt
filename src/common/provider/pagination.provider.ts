import { ObjectLiteral, Repository } from 'typeorm';
import { Paginated } from '../interface/paginated.interface';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export class PaginationProvider {
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    respository: Repository<T>,
  ): Promise<Paginated<T>> {

    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;

    const result = await respository.find({
        
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalItems = await respository.count();
    const totalPages = Math.ceil(totalItems / limit);

    const finalresult: Paginated<T> = {
      data: result,
      meta: {
        totalPages,
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
      },
    };

    return finalresult;
  }
}