import { ApiProperty } from '@nestjs/swagger';

export class NoteSchema {
  @ApiProperty({ description: 'The unique identifier of the note' })
  id: number;

  @ApiProperty({ description: 'The title of the note' })
  title: string;

  @ApiProperty({ description: 'The body content of the note' })
  body: string;

  @ApiProperty({ description: 'Array of tags associated with the note' })
  tags: string[];

  constructor(partial: Partial<NoteSchema>) {
    Object.assign(this, partial);
  }
}
