import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { jwtConstants } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

describe('AuthController', () => {
  let controller: AuthController;
  let prismaService: PrismaService;
  let user: CreateUserDto;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        ThrottlerModule.forRoot([
          {
            ttl: 60,
            limit: 10,
          },
        ]),
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        PrismaService,
        AuthService,
        UsersService,
        LocalStrategy,
        JwtStrategy,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    prismaService = module.get<PrismaService>(PrismaService);
    user = {
      email: 'test@example.com',
      password: 'password',
      name: 'test',
    };
  });

  afterAll(async () => {
    await prismaService.user.delete({
      where: {
        email: user.email,
      },
    });
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return the registered user', async () => {
      const result = await controller.register({ ...user });

      expect({ email: result.email, name: result.name }).toEqual({
        email: user.email,
        name: user.name,
      });
    });
  });

  describe('login', () => {
    it('should return access token on login', async () => {
      const result = await controller.login({
        email: user.email,
        password: user.password,
      });
      expect(result).toHaveProperty('access_token');
    });
  });
});
