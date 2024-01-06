import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  controllers: [NotesController],
  providers: [PrismaService, NotesService],
})
export class NotesModule {}
