// src/modules/categories/seed/demo-categories-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Category } from '../entities/category.entity';

export const DEMO_CATEGORY_SEEDS = [
  {
    slug: 'demo-electronics',
    name: 'Demo Electronics',
    imgUrl: '/assets/demo/categories/electronics.png',
    sortOrder: 10,
  },
  {
    slug: 'demo-audio',
    name: 'Demo Audio',
    imgUrl: '/assets/demo/categories/audio.png',
    sortOrder: 20,
  },
  {
    slug: 'demo-accessories',
    name: 'Demo Accessories',
    imgUrl: '/assets/demo/categories/accessories.png',
    sortOrder: 30,
  },
] as const;

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
