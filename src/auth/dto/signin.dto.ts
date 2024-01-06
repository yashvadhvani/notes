import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SiginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
