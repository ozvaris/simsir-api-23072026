// src/modules/product-media/repositories/product-media.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListProductMediaQueryDto } from '../dto/list-product-media-query.dto';
import { ProductMedia } from '../entities/product-media.entity';

@Injectable()
export class ProductMediaRepository {
  constructor(
    @InjectRepository(ProductMedia)
    private readonly productMediaRepository: Repository<ProductMedia>,
  ) {}

  createProductMedia(data: Partial<ProductMedia>): ProductMedia {
    return this.productMediaRepository.create(data);
  }

  async findMediaByProductId(
    productId: string,
    query: ListProductMediaQueryDto,
  ): Promise<[ProductMedia[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.productMediaRepository.findAndCount({
      where: { productId },
      order: {
        sortOrder: 'ASC',
        createdAt: 'ASC',
      },
      skip,
      take: limit,
    });
  }

  saveProductMedia(media: ProductMedia): Promise<ProductMedia> {
    return this.productMediaRepository.save(media);
  }

  findProductMediaById(mediaId: string): Promise<ProductMedia | null> {
    return this.findMediaById(mediaId);
  }

  findMediaById(mediaId: string): Promise<ProductMedia | null> {
    return this.productMediaRepository.findOne({
      where: { id: mediaId },
    });
  }

  async removeProductMedia(media: ProductMedia): Promise<void> {
    await this.productMediaRepository.remove(media);
  }
}
