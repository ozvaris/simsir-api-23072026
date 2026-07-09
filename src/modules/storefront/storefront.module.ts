import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { FeaturedCategory } from './entities/featured-category.entity';
import { StorefrontCollectionItem } from './entities/storefront-collection-item.entity';
import { StorefrontCollection } from './entities/storefront-collection.entity';
import { StorefrontAdminController } from './storefront-admin.controller';
import { StorefrontController } from './storefront.controller';
import { StorefrontRepository } from './repositories/storefront.repository';
import { StorefrontSeedService } from './seed/storefront-seed.service';
import { StorefrontService } from './storefront.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      FeaturedCategory,
      StorefrontCollection,
      StorefrontCollectionItem,
    ]),
  ],
  controllers: [StorefrontController, StorefrontAdminController],
  providers: [StorefrontService, StorefrontRepository, StorefrontSeedService],
  exports: [StorefrontService, StorefrontRepository, TypeOrmModule],
})
export class StorefrontModule {}
