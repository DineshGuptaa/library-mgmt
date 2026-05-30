import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query, Request } from "@nestjs/common";
import { AuthorService } from "./services/author.service";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Auth } from "../auth/decorators/auth.decorator";
import { AuthType } from "../auth/enum/auth-type.enum";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../../common/enum/roles.enum";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { SearchAuthorsDto } from "../search/dto/search-authors.dto";

@ApiTags("Authors")
@ApiBearerAuth()
@Controller("api/v1/authors")
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @Auth(AuthType.None)
  @ApiOperation({ summary: "Get all authors with pagination and search" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiQuery({ name: "search", required: false, description: "Search by name or bio" })
  async findAll(@Query() paginationQuery: SearchAuthorsDto) {
    const result = await this.authorService.findAll(paginationQuery);
    return { success: true, message: "Authors fetched successfully", ...result };
  }

  @Get("me")
  @ApiBearerAuth()
  @Roles(Role.AUTHOR)
  @ApiOperation({ summary: "Get current author profile" })
  async getProfile(@Request() req) {
    const author = await this.authorService.findByUserId(req.user.sub);
    return { success: true, message: "Author profile fetched successfully", data: author };
  }

  @Get(":id")
  @Auth(AuthType.None)
  @ApiOperation({ summary: "Get author by ID" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const author = await this.authorService.findOne(id);
    return { success: true, message: "Author fetched successfully", data: author };
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update author details (ADMIN only)" })
  async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateAuthorDto) {
    const author = await this.authorService.updateAuthor(id, dto);
    return { success: true, message: "Author updated successfully", data: author };
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete an author and associated user (ADMIN only)" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.authorService.deleteAuthor(id);
    return { success: true, message: "Author deleted successfully" };
  }
}
