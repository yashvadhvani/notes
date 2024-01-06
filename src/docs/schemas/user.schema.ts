import { ApiProperty } from '@nestjs/swagger';

export class UserSchema {
  @ApiProperty({
    type: String,
    description: 'Email of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Password of the user',
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    type: String,
    description: 'Name of the user',
    example: 'User',
  })
  name: string;

  constructor(partial: Partial<UserSchema>) {
    Object.assign(this, partial);
  }
}
