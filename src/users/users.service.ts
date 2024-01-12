import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<Partial<User>> {
    try {
      const user = await this.prisma.user.create({
        data,
      });
      return { email: user.email, id: user.id, name: user.name };
    } catch (error) {
      if (error?.meta?.target.includes('email')) {
        throw new Error('Unique Constraint Violation');
      }
    }
  }

  async findOne(data: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: data,
    });

    return user;
  }
}
