import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { NoteSchema } from '../docs/schemas/notes.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a note' })
  @ApiBody({ type: CreateNoteDto, description: 'Note details for creation' })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: NoteSchema,
  })
  @Throttle({ default: { limit: 5, ttl: 60 } }) //5 requests per 60 seconds
  async create(
    @Body(new ValidationPipe()) createNoteDto: CreateNoteDto,
    @Req() req,
  ) {
    return this.notesService.create(createNoteDto, +req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes' })
  @ApiResponse({
    status: 200,
    description: 'Return all notes',
    type: [NoteSchema],
  })
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests per 60 seconds
  async findAll(@Req() req) {
    return this.notesService.findAll({
      where: { authorId: +req.user.id },
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search notes' })
  @ApiResponse({
    status: 200,
    description: 'Return search results',
    type: [NoteSchema],
  })
  @ApiResponse({
    status: 404,
    description: 'No notes found matching the search query',
  })
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests per 60 seconds
  async search(@Query('query') query: string) {
    if (!query) {
      throw new NotFoundException('Search query parameter is required');
    }

    const searchResults = await this.notesService.searchNotes(query);

    if (searchResults.length === 0) {
      throw new NotFoundException('No notes found matching the search query');
    }

    return searchResults;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the note',
    type: NoteSchema,
  })
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 requests per 60 seconds
  async findOne(@Req() req, @Param('id') id: string) {
    return this.notesService.findOne({ id: +id, authorId: +req.user.id });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a note by ID' })
  @ApiBody({ type: UpdateNoteDto, description: 'Updated note details' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: NoteSchema,
  })
  @Throttle({ default: { limit: 5, ttl: 60 } }) //5 requests per 60 seconds
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateOne(id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note by ID' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per 60 seconds
  async remove(@Req() req, @Param('id') id: string) {
    return this.notesService.delete({ id: +id, authorId: +req.user.id });
  }
}
