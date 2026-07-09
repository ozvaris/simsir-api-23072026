import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateFeaturedCategoryDto } from './dto/create-featured-category.dto';
import { CreateStorefrontCollectionItemDto } from './dto/create-storefront-collection-item.dto';
import { CreateStorefrontCollectionDto } from './dto/create-storefront-collection.dto';
import { UpdateFeaturedCategoryDto } from './dto/update-featured-category.dto';
import { UpdateStorefrontCollectionItemDto } from './dto/update-storefront-collection-item.dto';
import { UpdateStorefrontCollectionDto } from './dto/update-storefront-collection.dto';
import { StorefrontService } from './storefront.service';

@Controller('admin/storefront')
export class StorefrontAdminController {
  constructor(private readonly storefrontService: StorefrontService) {}

  @Get('featured-categories')
  @Permissions('catalog.product.read')
  listFeaturedCategories() {
    return this.storefrontService.listFeaturedCategories();
  }

  @Post('featured-categories')
  @Permissions('catalog.product.update')
  createFeaturedCategory(@Body() dto: CreateFeaturedCategoryDto) {
    return this.storefrontService.createFeaturedCategory(dto);
  }

  @Patch('featured-categories/:featuredCategoryId')
  @Permissions('catalog.product.update')
  updateFeaturedCategory(
    @Param('featuredCategoryId', new ParseUUIDPipe())
    featuredCategoryId: string,
    @Body() dto: UpdateFeaturedCategoryDto,
  ) {
    return this.storefrontService.updateFeaturedCategory(
      featuredCategoryId,
      dto,
    );
  }

  @Delete('featured-categories/:featuredCategoryId')
  @Permissions('catalog.product.update')
  deleteFeaturedCategory(
    @Param('featuredCategoryId', new ParseUUIDPipe())
    featuredCategoryId: string,
  ) {
    return this.storefrontService.deleteFeaturedCategory(featuredCategoryId);
  }

  @Get('collections')
  @Permissions('catalog.product.read')
  listCollections() {
    return this.storefrontService.listCollections();
  }

  @Post('collections')
  @Permissions('catalog.product.update')
  createCollection(@Body() dto: CreateStorefrontCollectionDto) {
    return this.storefrontService.createCollection(dto);
  }

  @Patch('collections/:collectionId')
  @Permissions('catalog.product.update')
  updateCollection(
    @Param('collectionId', new ParseUUIDPipe()) collectionId: string,
    @Body() dto: UpdateStorefrontCollectionDto,
  ) {
    return this.storefrontService.updateCollection(collectionId, dto);
  }

  @Delete('collections/:collectionId')
  @Permissions('catalog.product.update')
  deleteCollection(
    @Param('collectionId', new ParseUUIDPipe()) collectionId: string,
  ) {
    return this.storefrontService.deleteCollection(collectionId);
  }

  @Get('collections/:collectionId/items')
  @Permissions('catalog.product.read')
  listCollectionItems(
    @Param('collectionId', new ParseUUIDPipe()) collectionId: string,
  ) {
    return this.storefrontService.listCollectionItems(collectionId);
  }

  @Post('collections/:collectionId/items')
  @Permissions('catalog.product.update')
  createCollectionItem(
    @Param('collectionId', new ParseUUIDPipe()) collectionId: string,
    @Body() dto: CreateStorefrontCollectionItemDto,
  ) {
    return this.storefrontService.createCollectionItem(collectionId, dto);
  }

  @Patch('collections/items/:itemId')
  @Permissions('catalog.product.update')
  updateCollectionItem(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: UpdateStorefrontCollectionItemDto,
  ) {
    return this.storefrontService.updateCollectionItem(itemId, dto);
  }

  @Delete('collections/items/:itemId')
  @Permissions('catalog.product.update')
  deleteCollectionItem(@Param('itemId', new ParseUUIDPipe()) itemId: string) {
    return this.storefrontService.deleteCollectionItem(itemId);
  }
}
