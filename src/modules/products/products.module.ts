// src/modules/products/products.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { Product } from './entities/product.entity';
import { ProductsAdminController } from './products-admin.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { DemoProductsSeedService } from './seed/demo-products-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product]),
    SystemSettingsModule,
  ],
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService, ProductsRepository, DemoProductsSeedService],
  exports: [ProductsService, ProductsRepository, TypeOrmModule],
})
export class ProductsModule {}
