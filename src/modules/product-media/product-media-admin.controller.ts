// src/modules/product-media/product-media-admin.controller.ts

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
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { ListProductMediaQueryDto } from './dto/list-product-media-query.dto';
import { UpdateProductMediaDto } from './dto/update-product-media.dto';
import { ProductMediaService } from './product-media.service';

@Controller('admin/products')
export class ProductMediaAdminController {
  constructor(private readonly productMediaService: ProductMediaService) {}

  @Get(':productId/media')
  @Permissions('catalog.product.read')
  listProductMedia(
    @Param('productId') productId: string,
    @Query() query: ListProductMediaQueryDto,
  ) {
    return this.productMediaService.listProductMedia(productId, query);
  }

  @Get('media/:mediaId')
  @Permissions('catalog.product.read')
  getProductMedia(@Param('mediaId') mediaId: string) {
    return this.productMediaService.getProductMedia(mediaId);
  }

  @Post(':productId/media')
  @Permissions('catalog.product.update')
  createProductMedia(
    @Param('productId') productId: string,
    @Body() dto: CreateProductMediaDto,
  ) {
    return this.productMediaService.createProductMedia(productId, dto);
  }

  @Patch('media/:mediaId')
  @Permissions('catalog.product.update')
  updateProductMedia(
    @Param('mediaId') mediaId: string,
    @Body() dto: UpdateProductMediaDto,
  ) {
    return this.productMediaService.updateProductMedia(mediaId, dto);
  }

  @Delete('media/:mediaId')
  @Permissions('catalog.product.update')
  deleteProductMedia(@Param('mediaId') mediaId: string) {
    return this.productMediaService.deleteProductMedia(mediaId);
  }
}
