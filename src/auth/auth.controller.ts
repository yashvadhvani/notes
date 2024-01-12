import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SiginDto } from './dto/signin.dto';
import { UserSchema } from '../docs/schemas/user.schema';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: SiginDto, description: 'User email and password' })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body(new ValidationPipe()) user: SiginDto) {
    return this.authService.login(user.email, user.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'User details for registration',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserSchema,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per 60 seconds for registration
  async register(@Body(new ValidationPipe()) user: CreateUserDto) {
    const newUser = await this.authService.register(user);
    return newUser;
  }
}
