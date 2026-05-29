import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "./entities/member.entity";
import { MembershipCard } from "../membership-card/entities/membership-card.entity";
import { User } from "../users/entities/user.entity";
import { MemberService } from "./services/member.service";
import { MemberController } from "./member.controller";
import { UsersModule } from "../users/user.module";
import { HashProvider } from "../auth/providers/hash.provider";
import { BcryptProvider } from "../auth/providers/bcrypt.provider";
import { PaginationModule } from "../../common/pagination.module";
import { SearchModule } from "../search/es.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MembershipCard, User]),
    UsersModule,
    PaginationModule,
    SearchModule,
  ],
  providers: [
    MemberService,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
  ],
  controllers: [MemberController],
  exports: [MemberService],
})
export class MemberModule {}
