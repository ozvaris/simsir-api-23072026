// src/modules/product-relations/product-relations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { ProductRelation } from './entities/product-relation.entity';
import { ProductRelationsAdminController } from './product-relations-admin.controller';
import { ProductRelationsService } from './product-relations.service';
import { ProductRelationsRepository } from './repositories/product-relations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductRelation]), ProductsModule],
  controllers: [ProductRelationsAdminController],
  providers: [ProductRelationsService, ProductRelationsRepository],
  exports: [ProductRelationsService, ProductRelationsRepository, TypeOrmModule],
})
export class ProductRelationsModule {}
