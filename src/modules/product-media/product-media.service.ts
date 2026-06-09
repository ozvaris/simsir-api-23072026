// src/modules/product-media/product-media.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../products/repositories/products.repository';
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { ListProductMediaQueryDto } from './dto/list-product-media-query.dto';
import { UpdateProductMediaDto } from './dto/update-product-media.dto';
import { toProductMediaResponse } from './mappers/product-media.mapper';
import { ProductMediaRepository } from './repositories/product-media.repository';

@Injectable()
export class ProductMediaService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productMediaRepository: ProductMediaRepository,
  ) {}

  async listProductMedia(productId: string, query: ListProductMediaQueryDto) {
    const product = await this.productsRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [media, totalItems] =
      await this.productMediaRepository.findMediaByProductId(productId, query);

    return {
      items: media.map(toProductMediaResponse),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getProductMedia(mediaId: string) {
    const media = await this.productMediaRepository.findMediaById(mediaId);

    if (!media) {
      throw new NotFoundException('Product media not found');
    }

    return toProductMediaResponse(media);
  }

  async createProductMedia(productId: string, dto: CreateProductMediaDto) {
    const product = await this.productsRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const media = this.productMediaRepository.createProductMedia({
      productId,
      src: dto.src.trim(),
      alt: dto.alt?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
    });

    const savedMedia =
      await this.productMediaRepository.saveProductMedia(media);

    return toProductMediaResponse(savedMedia);
  }

  async updateProductMedia(mediaId: string, dto: UpdateProductMediaDto) {
    const media =
      await this.productMediaRepository.findProductMediaById(mediaId);

    if (!media) {
      throw new NotFoundException('Product media not found');
    }

    if (dto.src !== undefined) {
      media.src = dto.src.trim();
    }

    if (dto.alt !== undefined) {
      media.alt = dto.alt?.trim() || null;
    }

    if (dto.sortOrder !== undefined) {
      media.sortOrder = dto.sortOrder;
    }

    const savedMedia =
      await this.productMediaRepository.saveProductMedia(media);

    return toProductMediaResponse(savedMedia);
  }

  async deleteProductMedia(mediaId: string): Promise<{ success: true }> {
    const media =
      await this.productMediaRepository.findProductMediaById(mediaId);

    if (!media) {
      throw new NotFoundException('Product media not found');
    }

    await this.productMediaRepository.removeProductMedia(media);

    return { success: true };
  }
}
