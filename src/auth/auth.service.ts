import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUserByEmail(email: string): Promise<User> {
    const user = await this.usersService.findOne({ email });
    return user;
  }

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.validateUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }

  async register(user: CreateUserDto): Promise<Partial<User> | null> {
    const userExists = await this.prisma.user.findUnique({
      where: { email: user.email },
    });
    if (userExists) {
      throw new ConflictException('Email already exists');
    }
    user.password = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersService.create(user);
    return newUser;
  }
}
