import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
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

  async validate(payload: any) {
    const userEmail = payload.email;
    const user = await this.authService.validateUserByEmail(userEmail);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
