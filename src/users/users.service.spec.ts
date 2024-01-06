import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  const userData: CreateUserDto = {
    email: 'yash1@gmail.com',
    password: 'yash@1234',
    name: 'yash',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(async () => {
    await prismaService.user.delete({
      where: {
        email: userData.email,
      },
    });
    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const result = await usersService.create({ ...userData });
      expect(result).toEqual(
        expect.objectContaining({ email: userData.email }),
      );
    });

    it('should handle creating a user with duplicate unique field values', async () => {
      const duplicateUserData: CreateUserDto = {
        email: 'yash1@gmail.com',
        password: 'yash@1234',
        name: 'yash',
      };

      await expect(
        usersService.create({ ...duplicateUserData }),
      ).rejects.toThrow('Unique Constraint Violation');
    });
  });

  describe('findOne', () => {
    it('should find an existing user by a valid unique identifier', async () => {
      const validIdentifier: Prisma.UserWhereUniqueInput = {
        email: 'yash1@gmail.com',
      };
      const expectedUser = {
        email: 'yash1@gmail.com',
        name: 'yash',
      };

      const result = await usersService.findOne(validIdentifier);
      expect({ email: result.email, name: result.name }).toEqual(expectedUser);
    });

    it('should handle finding a user with a non-existing unique identifier', async () => {
      const nonExistingIdentifier: Prisma.UserWhereUniqueInput = {
        email: 'yash3@gmail.com',
      };

      const result = await usersService.findOne(nonExistingIdentifier);
      expect(result).toBeNull();
    });
  });
});
