import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;
}
