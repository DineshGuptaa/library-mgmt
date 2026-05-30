import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  Query,
} from '@nestjs/common';
import { BookService } from './services/book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SearchBooksDto } from './dto/search-books.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enum/roles.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthType } from '../auth/enum/auth-type.enum';

@ApiTags('Books')
@ApiBearerAuth()
@Controller('api/v1')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('books')
  @ApiBearerAuth()
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiOperation({ summary: 'Add a new book (AUTHOR or ADMIN)' })
  async create(@Body() createBookDto: CreateBookDto, @Request() req) {
    return this.bookService.create(createBookDto, req.user);
  }

  @Get('books')
  @Auth(AuthType.None) // public
  @ApiOperation({ summary: 'Get all books with pagination and search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title, ISBN, or publisher name' })
  @ApiQuery({ name: 'publisherId', required: false, description: 'Filter by publisher ID' })
  @ApiQuery({ name: 'publishYear', required: false, description: 'Filter by publish year' })
  async findAll(@Query() searchBooksDto: SearchBooksDto) {
    const books = await this.bookService.findAll(searchBooksDto);
    return {
      success: true,
      message: 'Books retrieved successfully',
      ...books,
    };
  }

  @Get('books/:id')
  @Auth(AuthType.None) // public
  @ApiOperation({ summary: 'Get book by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const book = await this.bookService.findOne(id);
    return { success: true, message: 'Book fetched successfully', data: book };
  }

  @Patch('books/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.AUTHOR)
  @ApiOperation({ summary: 'Update book details (ADMIN or Author)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookDto, @Request() req) {
    const book = await this.bookService.updateBook(id, dto, req.user);
    return { success: true, message: 'Book updated successfully', data: book };
  }

  @Delete('books/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.AUTHOR)
  @ApiOperation({ summary: 'Delete a book (ADMIN or Author)' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.bookService.deleteBook(id, req.user);
    return { success: true, message: 'Book deleted successfully' };
  }

  @Get('book-categories')
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Get all book categories' })
  async findAllCategories() {
    const categories = await this.bookService.findAllCategories();
    return { success: true, message: 'Categories fetched successfully', data: categories };
  }

  @Get('publishers')
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Get all publishers' })
  async findAllPublishers() {
    const publishers = await this.bookService.findAllPublishers();
    return { success: true, message: 'Publishers fetched successfully', data: publishers };
  }
}
