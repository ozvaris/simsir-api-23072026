// src/modules/product-relations/product-relations-admin.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateProductRelationDto } from './dto/create-product-relation.dto';
import { ListProductRelationsQueryDto } from './dto/list-product-relations-query.dto';
import { ProductRelationsService } from './product-relations.service';

@Controller('admin/products')
export class ProductRelationsAdminController {
  constructor(
    private readonly productRelationsService: ProductRelationsService,
  ) {}

  @Get(':productId/relations')
  @Permissions('catalog.product.read')
  listProductRelations(
    @Param('productId') productId: string,
    @Query() query: ListProductRelationsQueryDto,
  ) {
    return this.productRelationsService.listProductRelations(productId, query);
  }

  @Get('relations/:relationId')
  @Permissions('catalog.product.read')
  getProductRelation(@Param('relationId') relationId: string) {
    return this.productRelationsService.getProductRelation(relationId);
  }

  @Post(':productId/relations')
  @Permissions('catalog.product.update')
  createProductRelation(
    @Param('productId') productId: string,
    @Body() dto: CreateProductRelationDto,
  ) {
    return this.productRelationsService.createProductRelation(productId, dto);
  }

  @Delete('relations/:relationId')
  @Permissions('catalog.product.update')
  deleteProductRelation(@Param('relationId') relationId: string) {
    return this.productRelationsService.deleteProductRelation(relationId);
  }
}
