// src/modules/products/seed/demo-products-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { STOREFRONT_MASTER_PRODUCT_SEEDS } from '../../../common/seed/storefront-master-seed.data';
import { Category } from '../../categories/entities/category.entity';
import { SYSTEM_SETTING_KEYS } from '../../system-settings/constants/system-setting-keys';
import { SystemSettingsService } from '../../system-settings/system-settings.service';
import { Product } from '../entities/product.entity';

export const DEMO_PRODUCT_SEEDS = STOREFRONT_MASTER_PRODUCT_SEEDS;

@Injectable()
export class DemoProductsSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoProductsSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo product seed.');
      return;
    }

    await this.seedProducts();
  }

  private async seedProducts(): Promise<void> {
    const defaultTax = this.systemSettingsService
      .getNumber(SYSTEM_SETTING_KEYS.PRODUCT_DEFAULT_TAX, 0)
      .toFixed(2);

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

      await this.findOrCreateProduct(seed, category.id, defaultTax);
    }
  }

  private async findOrCreateProduct(
    seed: (typeof DEMO_PRODUCT_SEEDS)[number],
    categoryId: string,
    defaultTax: string,
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { slug: seed.slug },
    });

    if (existingProduct) {
      existingProduct.title = seed.title;
      existingProduct.brandName = seed.brandName;
      existingProduct.categoryId = categoryId;
      existingProduct.price = seed.price;
      existingProduct.discount = seed.discount;
      existingProduct.tax = defaultTax;
      existingProduct.rating = seed.rating;
      existingProduct.imgUrl = seed.imgUrl;
      existingProduct.shortDescription = seed.shortDescription;
      existingProduct.longDescription = seed.shortDescription;
      existingProduct.isTrackedInventory = seed.isTrackedInventory;
      existingProduct.status = RecordStatus.ACTIVE;
      await this.productRepository.save(existingProduct);
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
        tax: defaultTax,
        rating: seed.rating,
        imgUrl: seed.imgUrl,
        shortDescription: seed.shortDescription,
        longDescription: seed.shortDescription,
        status: RecordStatus.ACTIVE,
      }),
    );
  }
}
