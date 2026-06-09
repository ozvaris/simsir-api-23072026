// src/modules/categories/categories-admin.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('admin/categories')
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Permissions('catalog.category.read')
  listCategories(@Query() query: ListCategoriesQueryDto) {
    return this.categoriesService.listCategoriesForAdmin(query);
  }

  @Get(':categoryId')
  @Permissions('catalog.category.read')
  getCategory(@Param('categoryId') categoryId: string) {
    return this.categoriesService.getCategoryForAdmin(categoryId);
  }

  @Post()
  @Permissions('catalog.category.create')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Patch(':categoryId')
  @Permissions('catalog.category.update')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(categoryId, dto);
  }

  @Delete(':categoryId')
  @Permissions('catalog.category.delete')
  deleteCategory(@Param('categoryId') categoryId: string) {
    return this.categoriesService.deleteCategory(categoryId);
  }
}
