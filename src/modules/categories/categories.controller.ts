// src/modules/categories/categories.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';
import { CategoryProductsQueryDto } from './dto/category-products-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  listCategories() {
    return this.categoriesService.listCategories();
  }

  @Public()
  @Get(':slug/products')
  listCategoryProducts(
    @Param('slug') slug: string,
    @Query() query: CategoryProductsQueryDto,
  ) {
    return this.categoriesService.listCategoryProducts(slug, query);
  }

  @Public()
  @Get('tree')
  listCategoryTree() {
    return this.categoriesService.listCategoryTree();
  }

  @Public()
  @Get(':slug')
  getCategoryDetail(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryDetail(slug);
  }
}
