import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { NotesService } from './notes.service';

describe('NotesController (e2e)', () => {
  let app: INestApplication;
  let notesService: NotesService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    notesService = moduleFixture.get<NotesService>(NotesService);
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'yash@gmail.com', password: 'yash1234' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /notes - should create a note', async () => {
    const noteData = {
      title: 'Test Note',
      tags: ['tag1', 'tag2'],
      body: 'This is a test note.',
      authorId: 1,
      id: 1,
    };

    jest.spyOn(notesService, 'create').mockResolvedValue(noteData);

    const response = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(noteData)
      .expect(201);

    expect(response.body).toEqual(noteData);
  });

  it('GET /notes - should retrieve all notes for the authenticated user', async () => {
    const mockedNotes = [
      {
        id: 1,
        title: 'Note 1',
        tags: ['tag1'],
        body: 'Content of note 1',
        authorId: 1,
      },
      {
        id: 2,
        title: 'Note 2',
        tags: ['tag2'],
        body: 'Content of note 2',
        authorId: 1,
      },
    ];

    jest.spyOn(notesService, 'findAll').mockResolvedValue(mockedNotes);

    const response = await request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toEqual(mockedNotes);
  });

  it('GET /notes/:id - should retrieve a specific note for the authenticated user', async () => {
    const noteId = 1;

    const mockedNote = {
      id: noteId,
      title: 'Test Note',
      tags: ['tag1', 'tag2'],
      body: 'This is a test note.',
      authorId: 1,
    };

    jest.spyOn(notesService, 'findOne').mockResolvedValue(mockedNote);

    const response = await request(app.getHttpServer())
      .get(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toEqual(mockedNote);
  });

  it('PUT /notes/:id - should update a specific note for the authenticated user', async () => {
    const noteId = 1;
    const updatedNoteData = {
      title: 'Updated Title',
      tags: ['tag1', 'tag2'],
      body: 'Updated content',
      authorId: 1,
    };

    const mockedUpdatedNote = {
      id: noteId,
      ...updatedNoteData,
    };

    jest.spyOn(notesService, 'updateOne').mockResolvedValue(mockedUpdatedNote);

    const response = await request(app.getHttpServer())
      .put(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedNoteData)
      .expect(200);

    expect(response.body).toEqual(mockedUpdatedNote);
  });

  it('DELETE /notes/:id - should remove a specific note for the authenticated user', async () => {
    const noteId = 1;
    const noteBody = { count: 1 };
    jest.spyOn(notesService, 'delete').mockResolvedValue(noteBody);

    const response = await request(app.getHttpServer())
      .delete(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toEqual(noteBody);
  });

  it('GET /notes/search - should search notes based on the query', async () => {
    const searchQuery = 'note';

    const mockedSearchResults = [
      {
        id: 1,
        title: 'Test Note 1',
        tags: ['tag1'],
        body: 'This is a test note 1.',
        authorId: 1,
      },
      {
        id: 2,
        title: 'Note 2',
        tags: ['tag2'],
        body: 'This is another note.',
        authorId: 1,
      },
    ];

    jest
      .spyOn(notesService, 'searchNotes')
      .mockResolvedValue(mockedSearchResults);

    const response = await request(app.getHttpServer())
      .get(`/notes/search?query=${searchQuery}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toEqual(mockedSearchResults);
  });
});
