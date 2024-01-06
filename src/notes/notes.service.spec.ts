import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ReturnUser, UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from '../constants';
import { Note } from '@prisma/client';

describe('NotesService', () => {
  let notesService: NotesService;
  let prismaService: PrismaService;
  let authService: AuthService;
  let mockNewUser: ReturnUser;
  let mockNewUser2: ReturnUser;
  let noteResult: Note;

  const createNoteDto: CreateNoteDto = {
    title: 'Test Note',
    tags: ['tag1', 'tag2'],
    body: 'This is a test note.',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        JwtService,
        UsersService,
        PrismaService,
        NotesService,
      ],
    }).compile();

    notesService = module.get<NotesService>(NotesService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    mockNewUser = await authService.register({
      email: 'usr@example.com',
      password: 'newpassword',
      name: 'hi',
    });
    mockNewUser2 = await authService.register({
      email: 'usr2@example.com',
      password: 'newpassword',
      name: 'hi',
    });
  });
  afterAll(async () => {
    await prismaService.user.delete({ where: { email: mockNewUser.email } });
    await prismaService.user.delete({ where: { email: mockNewUser2.email } });

    if (mockNewUser?.id) {
      await prismaService.note.deleteMany({
        where: { id: mockNewUser.id },
      });
    }

    if (mockNewUser2?.id) {
      await prismaService.note.deleteMany({
        where: { id: mockNewUser.id },
      });
    }

    await prismaService.$disconnect();
  });

  it('should be defined', () => {
    expect(notesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a note', async () => {
      const result = await notesService.create(createNoteDto, mockNewUser.id);
      noteResult = result;
      expect({
        title: result.title,
        tags: result.tags,
        body: result.body,
        authorId: result.authorId,
      }).toEqual({ ...createNoteDto, authorId: mockNewUser.id });
    });
  });

  describe('findOne', () => {
    it('should find a note by id', async () => {
      const mockedNote = {
        id: noteResult.id,
        title: 'Test Note',
        tags: ['tag1', 'tag2'],
        body: 'This is a test note.',
      };

      const result = await notesService.findOne({ id: noteResult.id });
      expect({
        id: result.id,
        title: result.title,
        tags: result.tags,
        body: result.body,
      }).toEqual(mockedNote);
    });

    it('should throw NotFoundException if note is not found', async () => {
      await expect(notesService.findOne({ id: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOne', () => {
    it('should update a note', async () => {
      const updateNoteDto: UpdateNoteDto = {
        title: 'Updated Note',
        tags: ['tag1', 'tag2'],
        body: 'This is an updated note.',
      };

      const mockedExistingNote = {
        id: noteResult.id,
        title: 'Test Note',
        tags: ['tag1', 'tag2'],
        body: 'This is a test note.',
      };

      const expectedUpdatedNote = {
        id: noteResult.id,
        ...mockedExistingNote,
        ...updateNoteDto,
      };

      const result = await notesService.updateOne(noteResult.id, updateNoteDto);
      noteResult = { ...result };
      expect({
        id: result.id,
        title: result.title,
        tags: result.tags,
        body: result.body,
      }).toEqual(expectedUpdatedNote);
    });

    it('should throw NotFoundException if note is not found for update', async () => {
      await expect(
        notesService.updateOne(999, {} as UpdateNoteDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchNotes', () => {
    it('should search notes by string', async () => {
      const searchString = 'note';

      const mockedSearchResults = [{ ...noteResult }];

      const result = await notesService.searchNotes(searchString);
      expect(result).toEqual(mockedSearchResults);
    });

    it('should throw NotFoundException if no notes found for search', async () => {
      const searchString = 'non-existent';

      await expect(notesService.searchNotes(searchString)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('shareNote', () => {
    it('should share a note with multiple users', async () => {
      const noteId = noteResult.id;
      const userIds = [mockNewUser2.id];

      const result = await notesService.shareNote(noteId, userIds);
      expect(result.sharedWith[0].email).toBe(mockNewUser2.email);
    });

    it('should throw NotFoundException if note is not found for sharing', async () => {
      await expect(notesService.shareNote(999, [1])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSharedNotes', () => {
    it('should get notes shared with a specific user', async () => {
      const result = await notesService.getSharedNotes(mockNewUser2.id);
      expect(result.sharedNotes[0].id).toEqual(noteResult.id);
    });
  });

  describe('delete', () => {
    it('should delete a note', async () => {
      const result = await notesService.delete({ authorId: mockNewUser.id });
      expect(result).toEqual({ count: 1 });
    });
  });
});
