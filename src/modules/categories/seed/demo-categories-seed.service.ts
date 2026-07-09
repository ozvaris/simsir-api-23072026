// src/modules/categories/seed/demo-categories-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { STOREFRONT_MASTER_CATEGORY_SEEDS } from '../../../common/seed/storefront-master-seed.data';
import { Category } from '../entities/category.entity';

export const DEMO_CATEGORY_SEEDS = STOREFRONT_MASTER_CATEGORY_SEEDS;

@Injectable()
export class DemoCategoriesSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoCategoriesSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo category seed.');
      return;
    }

    await this.seedCategories();
  }

  private async seedCategories(): Promise<void> {
    for (const seed of DEMO_CATEGORY_SEEDS) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: seed.slug },
      });

      if (existingCategory) {
        existingCategory.parentId = null;
        existingCategory.name = seed.name;
        existingCategory.imgUrl = seed.imgUrl;
        existingCategory.sortOrder = seed.sortOrder;
        existingCategory.status = RecordStatus.ACTIVE;
        await this.categoryRepository.save(existingCategory);
        continue;
      }

      await this.categoryRepository.save(
        this.categoryRepository.create({
          parentId: null,
          slug: seed.slug,
          name: seed.name,
          imgUrl: seed.imgUrl,
          sortOrder: seed.sortOrder,
          status: RecordStatus.ACTIVE,
        }),
      );
    }
  }
}
