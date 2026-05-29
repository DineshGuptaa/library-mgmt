import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Borrowing } from "../entities/borrowing.entity";
import { BorrowBookDto } from "../dto/borrow-book.dto";
import { MemberService } from "../../member/services/member.service";
import { BookService } from "../../book/services/book.service";

@Injectable()
export class BorrowingService {
  private readonly MAX_BORROW_LIMIT = 5;

  constructor(
    @InjectRepository(Borrowing)
    private readonly borrowingRepository: Repository<Borrowing>,
    private readonly memberService: MemberService,
    private readonly bookService: BookService,
  ) {}

  async borrowBook(borrowBookDto: BorrowBookDto): Promise<any> {
    const member = await this.memberService.findOne(borrowBookDto.memberId);

    if (!member.membershipCard) {
      throw new ForbiddenException("Membership card required to borrow a book.");
    }

    const now = new Date();
    if (member.membershipCard.expiryDate < now) {
      throw new ForbiddenException("Your membership card has expired. Please renew it.");
    }

    const activeCount = await this.borrowingRepository.count({
      where: { member: { id: member.id }, returnDate: IsNull() },
    });
    if (activeCount >= this.MAX_BORROW_LIMIT) {
      throw new BadRequestException(
        `You have reached the maximum limit of ${this.MAX_BORROW_LIMIT} borrowed books. Please return a book before borrowing another.`,
      );
    }

    const book = await this.bookService.findOne(borrowBookDto.bookId);

    const existingBorrowing = await this.borrowingRepository.findOne({
      where: { book: { id: book.id }, returnDate: IsNull() },
    });
    if (existingBorrowing) {
      throw new BadRequestException("Book '" + book.title + "' is already borrowed.");
    }

    const borrowing = this.borrowingRepository.create({
      member,
      book,
      borrowDate: new Date(),
    });

    try {
      const saved = await this.borrowingRepository.save(borrowing);
      return {
        success: true,
        message: "Book borrowed successfully",
        data: {
          id: saved.id,
          memberId: member.id,
          bookId: book.id,
          bookTitle: book.title,
          borrowDate: saved.borrowDate,
          cardExpiresOn: member.membershipCard.expiryDate,
        },
      };
    } catch (error: any) {
      throw new InternalServerErrorException("Failed to borrow the book");
    }
  }

  async findByMember(memberId: number): Promise<Borrowing[]> {
    return this.borrowingRepository.find({
      where: { member: { id: memberId } },
      relations: ["book", "book.author"],
      order: { borrowDate: "DESC" },
    });
  }

  async returnBook(borrowingId: number): Promise<any> {
    const borrowing = await this.borrowingRepository.findOne({
      where: { id: borrowingId },
      relations: ["book"],
    });
    if (!borrowing) {
      throw new NotFoundException("Borrowing record not found");
    }
    if (borrowing.returnDate) {
      throw new BadRequestException("Book has already been returned");
    }
    borrowing.returnDate = new Date();
    await this.borrowingRepository.save(borrowing);
    return { success: true, message: "Book returned successfully" };
  }
}
