import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger;

  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const defaultSecret = 'defaultSecret';

    // Call super() first
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret || defaultSecret,
    });

    // Initialize logger after super() call
    this.logger = new Logger(JwtStrategy.name);

    // Check if JWT_SECRET exists and log warning if not
    if (!jwtSecret) {
      this.logger.warn(
        'JWT_SECRET not provided in environment variables. Using insecure default secret. ' +
          'This should be changed in production!',
      );
    }
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role, // Using singular role instead of roles
    };
  }
}
