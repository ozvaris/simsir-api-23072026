// src/modules/product-relations/product-relations.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductsRepository } from '../products/repositories/products.repository';
import { CreateProductRelationDto } from './dto/create-product-relation.dto';
import { ListProductRelationsQueryDto } from './dto/list-product-relations-query.dto';
import { toProductRelationResponse } from './mappers/product-relations.mapper';
import { ProductRelationsRepository } from './repositories/product-relations.repository';

@Injectable()
export class ProductRelationsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productRelationsRepository: ProductRelationsRepository,
  ) {}

  async listProductRelations(
    productId: string,
    query: ListProductRelationsQueryDto,
  ) {
    const product = await this.productsRepository.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [relations, totalItems] =
      await this.productRelationsRepository.findRelationsByProductId(
        productId,
        query,
      );

    return {
      items: relations.map(toProductRelationResponse),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getProductRelation(relationId: string) {
    const relation =
      await this.productRelationsRepository.findRelationById(relationId);

    if (!relation) {
      throw new NotFoundException('Product relation not found');
    }

    return toProductRelationResponse(relation);
  }

  async createProductRelation(
    sourceProductId: string,
    dto: CreateProductRelationDto,
  ) {
    const sourceProduct =
      await this.productsRepository.findProductById(sourceProductId);

    if (!sourceProduct) {
      throw new NotFoundException('Source product not found');
    }

    const targetProduct = await this.productsRepository.findProductById(
      dto.targetProductId,
    );

    if (!targetProduct) {
      throw new NotFoundException('Target product not found');
    }

    if (sourceProductId === dto.targetProductId) {
      throw new ConflictException('Product cannot be related to itself');
    }

    const existingRelation =
      await this.productRelationsRepository.findRelationByUnique(
        sourceProductId,
        dto.targetProductId,
        dto.relationType,
      );

    if (existingRelation) {
      throw new ConflictException('Product relation already exists');
    }

    const relation = this.productRelationsRepository.createProductRelation({
      sourceProductId,
      targetProductId: dto.targetProductId,
      relationType: dto.relationType,
    });

    const savedRelation =
      await this.productRelationsRepository.saveProductRelation(relation);

    return toProductRelationResponse(savedRelation);
  }

  async deleteProductRelation(relationId: string): Promise<{ success: true }> {
    const relation =
      await this.productRelationsRepository.findProductRelationById(relationId);

    if (!relation) {
      throw new NotFoundException('Product relation not found');
    }

    await this.productRelationsRepository.removeProductRelation(relation);

    return { success: true };
  }
}
