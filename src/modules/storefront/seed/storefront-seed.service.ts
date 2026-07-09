import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import {
  STOREFRONT_FLASH_DEAL_PRODUCT_IDS,
  STOREFRONT_HOME_CATEGORY_SLUGS,
  STOREFRONT_MASTER_PRODUCT_SEEDS,
  STOREFRONT_RECOMMENDED_PRODUCT_IDS,
} from '../../../common/seed/storefront-master-seed.data';
import { StorefrontCollectionType } from '../enums/storefront-collection-type.enum';
import { StorefrontRepository } from '../repositories/storefront.repository';

@Injectable()
export class StorefrontSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StorefrontSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly storefrontRepository: StorefrontRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping storefront seed.');
      return;
    }

    await this.seedFeaturedCategories();
    await this.seedFlashDealsCollection();
    await this.seedRecommendedCollection();
  }

  private async seedFeaturedCategories(): Promise<void> {
    for (const [index, categorySlug] of STOREFRONT_HOME_CATEGORY_SLUGS.entries()) {
      const category = await this.storefrontRepository.findActiveCategoryBySlug(
        categorySlug,
      );

      if (!category) {
        this.logger.warn(
          `Skipping storefront featured category; category ${categorySlug} was not found.`,
        );
        continue;
      }

      const existing =
        await this.storefrontRepository.findFeaturedCategoryByCategoryId(
          category.id,
        );

      if (existing) {
        existing.sortOrder = (index + 1) * 10;
        existing.status = RecordStatus.ACTIVE;
        await this.storefrontRepository.saveFeaturedCategory(existing);
        continue;
      }

      await this.storefrontRepository.saveFeaturedCategory(
        this.storefrontRepository.createFeaturedCategory({
          categoryId: category.id,
          sortOrder: (index + 1) * 10,
          status: RecordStatus.ACTIVE,
        }),
      );
    }
  }

  private async seedFlashDealsCollection(): Promise<void> {
    await this.seedCollectionFromFrontendIds({
      type: StorefrontCollectionType.FLASH_DEALS,
      title: 'Discount Products',
      viewAllHref: '/products',
      sortOrder: 10,
      frontendIds: STOREFRONT_FLASH_DEAL_PRODUCT_IDS,
      logLabel: 'flash-deal',
    });
  }

  private async seedRecommendedCollection(): Promise<void> {
    await this.seedCollectionFromFrontendIds({
      type: StorefrontCollectionType.EDITOR_PICKS,
      title: 'More For You',
      viewAllHref: '/products',
      sortOrder: 20,
      frontendIds: STOREFRONT_RECOMMENDED_PRODUCT_IDS,
      logLabel: 'recommended',
    });
  }

  private async seedCollectionFromFrontendIds(params: {
    type: StorefrontCollectionType;
    title: string;
    viewAllHref: string;
    sortOrder: number;
    frontendIds: readonly string[];
    logLabel: string;
  }): Promise<void> {
    const collection =
      (await this.storefrontRepository.findCollectionByType(
        params.type,
      )) ??
      this.storefrontRepository.createCollection({
        type: params.type,
        title: params.title,
        viewAllHref: params.viewAllHref,
        sortOrder: params.sortOrder,
        status: RecordStatus.ACTIVE,
      });

    collection.title = params.title;
    collection.viewAllHref = params.viewAllHref;
    collection.sortOrder = params.sortOrder;
    collection.status = RecordStatus.ACTIVE;

    const savedCollection =
      await this.storefrontRepository.saveCollection(collection);

    for (const [index, frontendId] of params.frontendIds.entries()) {
      const productSeed = STOREFRONT_MASTER_PRODUCT_SEEDS.find(
        (item) => item.frontendId === frontendId,
      );

      if (!productSeed) {
        this.logger.warn(
          `Skipping storefront ${params.logLabel} item; frontend product ${frontendId} was not found in master seed.`,
        );
        continue;
      }

      const product =
        await this.storefrontRepository.findActiveProductBySlugWithCategoryAndInventory(
          productSeed.slug,
        );

      if (!product) {
        this.logger.warn(
          `Skipping storefront ${params.logLabel} item; product ${productSeed.slug} was not found.`,
        );
        continue;
      }

      const existing =
        await this.storefrontRepository.findCollectionItemByCollectionAndProduct(
          savedCollection.id,
          product.id,
        );

      if (existing) {
        existing.sortOrder = (index + 1) * 10;
        existing.status = RecordStatus.ACTIVE;
        await this.storefrontRepository.saveCollectionItem(existing);
        continue;
      }

      await this.storefrontRepository.saveCollectionItem(
        this.storefrontRepository.createCollectionItem({
          collectionId: savedCollection.id,
          productId: product.id,
          sortOrder: (index + 1) * 10,
          status: RecordStatus.ACTIVE,
        }),
      );
    }
  }
}
