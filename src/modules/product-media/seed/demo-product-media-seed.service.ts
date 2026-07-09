// src/modules/product-media/seed/demo-product-media-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Product } from '../../products/entities/product.entity';
import { ProductMedia } from '../entities/product-media.entity';

export const DEMO_PRODUCT_MEDIA_SEEDS = [
  {
    productSlug: 'nikecourt-zoom-vapor-cage',
    src: '/assets/superstore/flash-1.png',
    alt: 'NikeCourt Zoom Vapor Cage front view',
    sortOrder: 1,
  },
  {
    productSlug: 'nikecourt-zoom-vapor-cage',
    src: '/assets/superstore/category-fashion.png',
    alt: 'NikeCourt Zoom Vapor Cage alternate view',
    sortOrder: 2,
  },
  {
    productSlug: 'iphone-13-pro-max',
    src: '/assets/superstore/flash-3.png',
    alt: 'IPhone 13 Pro Max front view',
    sortOrder: 1,
  },
  {
    productSlug: 'tarz-t3',
    src: '/assets/superstore/more-tarz-t3.png',
    alt: 'Tarz T3 front view',
    sortOrder: 1,
  },
] as const;

@Injectable()
export class DemoProductMediaSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoProductMediaSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductMedia)
    private readonly productMediaRepository: Repository<ProductMedia>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo product media seed.');
      return;
    }

    await this.seedProductMedia();
  }

  private async seedProductMedia(): Promise<void> {
    for (const seed of DEMO_PRODUCT_MEDIA_SEEDS) {
      const product = await this.productRepository.findOne({
        where: { slug: seed.productSlug },
      });

      if (!product) {
        this.logger.warn(
          `Skipping demo product media ${seed.src}; product ${seed.productSlug} was not found.`,
        );
        continue;
      }

      const existingMedia = await this.productMediaRepository.findOne({
        where: {
          productId: product.id,
          src: seed.src,
        },
      });

      if (existingMedia) {
        continue;
      }

      await this.productMediaRepository.save(
        this.productMediaRepository.create({
          productId: product.id,
          src: seed.src,
          alt: seed.alt,
          sortOrder: seed.sortOrder,
        }),
      );
    }
  }
}
