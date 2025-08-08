import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    
    this.logger.log(`JWT Strategy initialized`);
    this.logger.log(`JWT Secret length: ${secret.length} characters`);
    this.logger.log(`JWT Secret preview: ${secret.substring(0, 10)}...`);
  }

  async validate(payload: any) {
    this.logger.log(`JWT Strategy validate called`);
    this.logger.log(`JWT payload:`, JSON.stringify(payload, null, 2));
    
    if (!payload.sub || !payload.email) {
      this.logger.error('Invalid JWT payload - missing sub or email');
      return null;
    }
    
    const user = { 
      userId: payload.sub, 
      email: payload.email,
      role: payload.role 
    };
    
    this.logger.log(`JWT validation successful for user: ${user.email} (ID: ${user.userId})`);
    return user;
  }
}