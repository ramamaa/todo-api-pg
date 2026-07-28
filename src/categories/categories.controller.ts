import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthRequest, @Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body.name, req.user.id);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyCategories(@Req() req: AuthRequest) {
    return this.categoriesService.findMyCategories(req.user.id);
  }
}
