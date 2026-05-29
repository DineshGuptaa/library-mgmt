// src/modules/membership-card/membership-card.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { MembershipCardService } from './services/membership-card.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Membership Cards')
@Controller('api/v1/membership-cards')
export class MembershipCardController {
  constructor(private readonly membershipCardService: MembershipCardService) {}

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get membership card by member ID' })
  async getByMember(@Param('memberId') memberId: number) {
    const card = await this.membershipCardService.getCardByMember(memberId);
    return {
      success: true,
      message: 'Membership card retrieved successfully',
      data: card,
    };
  }
}
