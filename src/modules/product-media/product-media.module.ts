// src/modules/product-media/product-media.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { ProductMedia } from './entities/product-media.entity';
import { ProductMediaAdminController } from './product-media-admin.controller';
import { ProductMediaService } from './product-media.service';
import { ProductMediaRepository } from './repositories/product-media.repository';
import { DemoProductMediaSeedService } from './seed/demo-product-media-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductMedia]), ProductsModule],
  controllers: [ProductMediaAdminController],
  providers: [
    ProductMediaService,
    ProductMediaRepository,
    DemoProductMediaSeedService,
  ],
  exports: [ProductMediaService, ProductMediaRepository, TypeOrmModule],
})
export class ProductMediaModule {}
