// src/modules/product-relations/seed/demo-product-relations-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Product } from '../../products/entities/product.entity';
import { ProductRelation } from '../entities/product-relation.entity';
import { ProductRelationType } from '../enums/product-relation-type.enum';

export const DEMO_PRODUCT_RELATION_SEEDS = [
  {
    sourceProductSlug: 'demo-wireless-headphones',
    targetProductSlug: 'demo-smart-watch',
    relationType: ProductRelationType.RELATED_PRODUCT,
  },
  {
    sourceProductSlug: 'demo-smart-watch',
    targetProductSlug: 'demo-wireless-headphones',
    relationType: ProductRelationType.RELATED_PRODUCT,
  },
  {
    sourceProductSlug: 'demo-smart-watch',
    targetProductSlug: 'demo-phone-case',
    relationType: ProductRelationType.FREQUENTLY_BOUGHT_TOGETHER,
  },
  {
    sourceProductSlug: 'demo-phone-case',
    targetProductSlug: 'demo-smart-watch',
    relationType: ProductRelationType.FREQUENTLY_BOUGHT_TOGETHER,
  },
] as const;

@Injectable()
export class DemoProductRelationsSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoProductRelationsSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductRelation)
    private readonly productRelationRepository: Repository<ProductRelation>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo product relation seed.');
      return;
    }

    await this.seedProductRelations();
  }

  private async seedProductRelations(): Promise<void> {
    for (const seed of DEMO_PRODUCT_RELATION_SEEDS) {
      const sourceProduct = await this.productRepository.findOne({
        where: { slug: seed.sourceProductSlug },
      });

      if (!sourceProduct) {
        this.logger.warn(
          `Skipping demo product relation; source product ${seed.sourceProductSlug} was not found.`,
        );
        continue;
      }

      const targetProduct = await this.productRepository.findOne({
        where: { slug: seed.targetProductSlug },
      });

      if (!targetProduct) {
        this.logger.warn(
          `Skipping demo product relation; target product ${seed.targetProductSlug} was not found.`,
        );
        continue;
      }

      if (sourceProduct.id === targetProduct.id) {
        this.logger.warn(
          `Skipping demo product relation; product ${seed.sourceProductSlug} cannot be related to itself.`,
        );
        continue;
      }

      const existingRelation = await this.productRelationRepository.findOne({
        where: {
          sourceProductId: sourceProduct.id,
          targetProductId: targetProduct.id,
          relationType: seed.relationType,
        },
      });

      if (existingRelation) {
        continue;
      }

      await this.productRelationRepository.save(
        this.productRelationRepository.create({
          sourceProductId: sourceProduct.id,
          targetProductId: targetProduct.id,
          relationType: seed.relationType,
        }),
      );
    }
  }
}
