import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';

import type { AuthRequest } from '../common/interfaces/auth-request.interface';

import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Get('public')
  findPublicTodos() {
    return this.todosService.findPublicTodos();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTodoDto, @Req() req: AuthRequest) {
    return this.todosService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMyTodos(@Req() req: AuthRequest) {
    return this.todosService.findMyTodos(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.todosService.delete(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoDto,
    @Req() req: AuthRequest,
  ) {
    return this.todosService.update(id, dto, req.user.id);
  }
}
