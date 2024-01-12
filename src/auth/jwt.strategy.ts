import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECERET,
    });
  }

  async validate(payload: Partial<User>) {
    const userEmail = payload.email;
    const user = await this.authService.validateUserByEmail(userEmail);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
