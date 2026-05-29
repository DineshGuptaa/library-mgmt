// src/modules/membership-card/services/membership-card.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipCard } from '../entities/membership-card.entity';

@Injectable()
export class MembershipCardService {
  constructor(
    @InjectRepository(MembershipCard)
    private readonly cardRepository: Repository<MembershipCard>,
  ) {}

  async getCardByMember(memberId: number): Promise<MembershipCard> {
    try {
      const card = await this.cardRepository.findOne({
        where: { member: { id: memberId } },
        relations: ['member'],
      });

      if (!card) {
        throw new NotFoundException(
          `No membership card found for member ID ${memberId}`,
        );
      }

      return card;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Get Membership Card Error:', error);
      throw new InternalServerErrorException('Failed to fetch membership card');
    }
  }
}
