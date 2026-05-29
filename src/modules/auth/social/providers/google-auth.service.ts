import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleUser } from '../../../users/interface/google-user.interface';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oauthClient!: OAuth2Client;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      console.warn('⚠️ GOOGLE_CLIENT_ID is not defined in environment variables');
    }

    this.oauthClient = new OAuth2Client({
      clientId: clientId,
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    });
  }

  async verifyToken(token: string): Promise<GoogleUser> {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload?.email) {
        throw new UnauthorizedException('Could not extract email from Google token.');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
        // picture: payload.picture,        
      };
    } catch (error: any) {
      console.error('Google Token Verification Error:', error.message);
      throw new UnauthorizedException('Invalid or expired Google token.');
    }
  }
}