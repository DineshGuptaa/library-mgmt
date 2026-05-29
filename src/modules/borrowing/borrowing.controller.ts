import { Controller, Get, Post, Patch, Param, ParseIntPipe, Body } from "@nestjs/common";
import { BorrowingService } from "./services/borrowing.service";
import { BorrowBookDto } from "./dto/borrow-book.dto";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../../common/enum/roles.enum";

@ApiTags("Borrowing")
@ApiBearerAuth()
@Controller("api/v1/borrowings")
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Post()
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: "Borrow a book (MEMBER + valid card required, max 5)" })
  async borrowBook(@Body() borrowBookDto: BorrowBookDto) {
    return this.borrowingService.borrowBook(borrowBookDto);
  }

  @Get("member/:memberId")
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: "Get all borrowings for a member" })
  async findByMember(@Param("memberId", ParseIntPipe) memberId: number) {
    const borrowings = await this.borrowingService.findByMember(memberId);
    return { success: true, message: "Borrowings fetched successfully", data: borrowings };
  }

  @Patch(":id/return")
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: "Return a borrowed book" })
  async returnBook(@Param("id", ParseIntPipe) id: number) {
    return this.borrowingService.returnBook(id);
  }
}
