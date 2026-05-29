import { Controller, Get, Post, Patch, Delete, Param, ParseIntPipe, Body, Query } from "@nestjs/common";
import { MemberService } from "./services/member.service";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../../common/enum/roles.enum";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { SearchMembersDto } from "../search/dto/search-members.dto";

@ApiTags("Members")
@ApiBearerAuth()
@Controller("api/v1/members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Create a member with user account (ADMIN only)" })
  async create(@Body() dto: CreateMemberDto) {
    const member = await this.memberService.createByAdmin(dto);
    return { success: true, message: "Member created successfully", data: member };
  }

  @Get()
  @Roles(Role.ADMIN, Role.MEMBER)
  @ApiOperation({ summary: "Get all members with pagination and search" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiQuery({ name: "search", required: false, description: "Search by name, email, or phone" })
  async findAll(@Query() paginationQuery: SearchMembersDto) {
    const result = await this.memberService.findAll(paginationQuery);
    return { success: true, message: "Members retrieved successfully", ...result };
  }

  @Get("me")
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: "Get current member profile (MEMBER only)" })
  async getMyProfile(@CurrentUser("sub") userId: number) {
    const member = await this.memberService.findByUserId(userId);
    return { success: true, message: "Member profile fetched successfully", data: member };
  }

  @Get(":id")
  @Roles(Role.MEMBER)
  @ApiOperation({ summary: "Get member by ID (MEMBER only)" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const member = await this.memberService.findOne(id);
    return { success: true, message: "Member retrieved successfully", data: member };
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Update member details (ADMIN only)" })
  async update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
    const member = await this.memberService.updateMember(id, dto);
    return { success: true, message: "Member updated successfully", data: member };
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Delete a member and associated user (ADMIN only)" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.memberService.deleteMember(id);
    return { success: true, message: "Member deleted successfully" };
  }
}
