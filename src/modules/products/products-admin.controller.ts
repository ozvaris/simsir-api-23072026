// src/modules/products/products-admin.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('admin/products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Permissions('catalog.product.read')
  listProducts(@Query() query: ListAdminProductsQueryDto) {
    return this.productsService.listProductsForAdmin(query);
  }

  @Get(':productId')
  @Permissions('catalog.product.read')
  getProduct(@Param('productId', new ParseUUIDPipe()) productId: string) {
    return this.productsService.getProductForAdmin(productId);
  }

  @Post()
  @Permissions('catalog.product.create')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Patch(':productId')
  @Permissions('catalog.product.update')
  updateProduct(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(productId, dto);
  }

  @Delete(':productId')
  @Permissions('catalog.product.delete')
  deleteProduct(@Param('productId', new ParseUUIDPipe()) productId: string) {
    return this.productsService.deleteProduct(productId);
  }
}
