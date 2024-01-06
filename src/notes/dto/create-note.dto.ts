import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsNotEmpty()
  body: string;
}
