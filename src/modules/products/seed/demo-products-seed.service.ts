// src/modules/products/seed/demo-products-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../entities/product.entity';

export const DEMO_PRODUCT_SEEDS = [
  {
    slug: 'demo-wireless-headphones',
    title: 'Demo Wireless Headphones',
    brandName: 'DemoSound',
    categorySlug: 'demo-audio',
    isTrackedInventory: true,
    price: '129.99',
    discount: '10.00',
    rating: '4.7',
    imgUrl: '/assets/demo/products/wireless-headphones.png',
    shortDescription: 'Demo wireless headphones for catalog testing.',
    longDescription:
      'A non-production demo product used for local catalog and storefront testing.',
  },
  {
    slug: 'demo-smart-watch',
    title: 'Demo Smart Watch',
    brandName: 'DemoWear',
    categorySlug: 'demo-electronics',
    isTrackedInventory: true,
    price: '199.99',
    discount: '0.00',
    rating: '4.5',
    imgUrl: '/assets/demo/products/smart-watch.png',
    shortDescription: 'Demo smart watch for catalog testing.',
    longDescription:
      'A non-production demo product used for local product detail testing.',
  },
  {
    slug: 'demo-phone-case',
    title: 'Demo Phone Case',
    brandName: 'DemoCase',
    categorySlug: 'demo-accessories',
    isTrackedInventory: true,
    price: '24.99',
    discount: '0.00',
    rating: '4.3',
    imgUrl: '/assets/demo/products/phone-case.png',
    shortDescription: 'Demo phone case for catalog testing.',
    longDescription:
      'A non-production demo product used for local category/product flows.',
  },
] as const;

@Injectable()
export class DemoProductsSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoProductsSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo product seed.');
      return;
    }

    await this.seedProducts();
  }

  private async seedProducts(): Promise<void> {
    for (const seed of DEMO_PRODUCT_SEEDS) {
      const category = await this.categoryRepository.findOne({
        where: { slug: seed.categorySlug },
      });

      if (!category) {
        this.logger.warn(
          `Skipping demo product ${seed.slug}; category ${seed.categorySlug} was not found.`,
        );
        continue;
      }

      await this.findOrCreateProduct(seed, category.id);
    }
  }

  private async findOrCreateProduct(
    seed: (typeof DEMO_PRODUCT_SEEDS)[number],
    categoryId: string,
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { slug: seed.slug },
    });

    if (existingProduct) {
      return existingProduct;
    }

    return this.productRepository.save(
      this.productRepository.create({
        slug: seed.slug,
        title: seed.title,
        brandName: seed.brandName,
        categoryId,
        isTrackedInventory: seed.isTrackedInventory,
        price: seed.price,
        discount: seed.discount,
        rating: seed.rating,
        imgUrl: seed.imgUrl,
        shortDescription: seed.shortDescription,
        longDescription: seed.longDescription,
        status: RecordStatus.ACTIVE,
      }),
    );
  }
}
