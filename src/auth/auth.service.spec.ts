import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { jwtConstants } from '../constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  const mockNewUser: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'newpassword',
    name: 'hi',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AuthService, JwtService, UsersService, PrismaService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.user.delete({ where: { email: mockNewUser.email } });
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user if email does not exist', async () => {
      const newUser = await authService.register({ ...mockNewUser });
      expect(newUser).toEqual(
        expect.objectContaining({ email: mockNewUser.email }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      await expect(
        authService.register({ ...mockNewUser, email: mockNewUser.email }),
      ).rejects.toThrow(ConflictException);
    });
  });
  describe('login', () => {
    it('should return access token if user is valid', async () => {
      const result = await authService.login(
        mockNewUser.email,
        mockNewUser.password,
      );
      expect(result.access_token).toBeDefined();
    });

    it('should throw UnauthorizedException if user is not valid', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = await authService.validateUser(
        mockNewUser.email,
        mockNewUser.password,
      );
      expect(user.email).toEqual(mockNewUser.email);
    });

    it('should return null if user is not found', async () => {
      await expect(
        authService.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      await expect(
        authService.validateUser(mockNewUser.email, 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
