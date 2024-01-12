import { Injectable, NotFoundException } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateNoteDto, authorId: number) {
    // Validate and sanitize data, then pass it to Prisma for database operations
    const createdNote = await this.prisma.note.create({
      data: {
        title: data.title,
        tags: data.tags,
        body: data.body,
        authorId,
      },
    });
    return createdNote;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.NoteWhereUniqueInput;
    where?: Prisma.NoteWhereInput;
    orderBy?: Prisma.NoteOrderByWithRelationInput;
  }): Promise<Note[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.note.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(data: Prisma.NoteWhereUniqueInput): Promise<Note | null> {
    const result = await this.prisma.note.findUnique({
      where: data,
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async updateOne(id: number, data: UpdateNoteDto): Promise<Note> {
    const note = await this.prisma.note.findUnique({ where: { id } });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        title: data.title ?? note.title,
        tags: data.tags ?? note.tags,
        body: data.body ?? note.body,
      },
    });
  }

  async delete(where: Prisma.NoteWhereInput): Promise<Prisma.BatchPayload> {
    return this.prisma.note.deleteMany({
      where,
    });
  }

  async searchNotes(searchString: string): Promise<Note[]> {
    const results = await this.prisma.note.findMany({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            body: { contains: searchString },
          },
          {
            tags: { hasSome: [searchString] },
          },
        ],
      },
    });
    if (results.length === 0) {
      throw new NotFoundException('No notes found matching the search query');
    }
    return results;
  }

  async shareNote(noteId: number, userIds: number[]) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const result = await this.prisma.note.update({
      where: { id: noteId },
      data: { sharedWith: { connect: userIds.map((id) => ({ id })) } },
      include: {
        sharedWith: true,
      },
    });
    return result;
  }

  async getSharedNotes(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { sharedNotes: true },
    });
  }
}
