// src/modules/product-relations/product-relations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { ProductRelation } from './entities/product-relation.entity';
import { ProductRelationsAdminController } from './product-relations-admin.controller';
import { ProductRelationsService } from './product-relations.service';
import { ProductRelationsRepository } from './repositories/product-relations.repository';
import { DemoProductRelationsSeedService } from './seed/demo-product-relations-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductRelation]), ProductsModule],
  controllers: [ProductRelationsAdminController],
  providers: [
    ProductRelationsService,
    ProductRelationsRepository,
    DemoProductRelationsSeedService,
  ],
  exports: [ProductRelationsService, ProductRelationsRepository, TypeOrmModule],
})
export class ProductRelationsModule {}
