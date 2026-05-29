import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './modules/member/member.module';
import { BorrowingModule } from './modules/borrowing/borrowing.module';
import { BookModule } from './modules/book/book.module';
import { AuthorModule } from './modules/author/author.module';
import { MembershipCardModule } from './modules/membership-card/membership-card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './modules/admin/admin.module';
import { SearchModule } from './modules/search/es.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      load: [appConfig, dbConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        
        // 👇 ADD YOUR DEBUG LOGS HERE 👇
        const dbUser = configService.get('DATABASE_USER'); // Check if this key is correct
        const dbPassword = configService.get('DATABASE_PASSWORD'); // Check if this key is correct
        const dbHost = configService.get('DATABASE_HOST');
        const dbPort = configService.get('DATABASE_PORT');

        console.log('--- DB CONFIG DEBUG ---');
        console.log(`Host: ${dbHost}`);
        console.log(`Port: ${dbPort}`);
        console.log(`User: ${dbUser}`);
        console.log(`Password Type: ${typeof dbPassword}`);
        console.log(`Password Raw Value: ${dbPassword}`); // Check if it has accidental whitespaces
        console.log('-----------------------');

        return {
          type: 'postgres',
          autoLoadEntities: configService.get('DATABASE_AUTOLOAD_ENTITIES'),
          synchronize: configService.get('DATABASE_SYNC') === 'true',
          port: dbPort,
          host: dbHost,
          username: dbUser,
          password: dbPassword,
          database: configService.get('DATABASE_NAME'),
        };
      },
    }),
    UsersModule,
    AuthModule,
    MemberModule,
    MembershipCardModule,
    AuthorModule,
    BookModule,
    BorrowingModule,
    EmailModule,
    AdminModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}