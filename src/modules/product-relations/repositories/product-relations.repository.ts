// src/modules/product-relations/repositories/product-relations.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListProductRelationsQueryDto } from '../dto/list-product-relations-query.dto';
import { ProductRelation } from '../entities/product-relation.entity';
import { ProductRelationType } from '../enums/product-relation-type.enum';

@Injectable()
export class ProductRelationsRepository {
  constructor(
    @InjectRepository(ProductRelation)
    private readonly productRelationRepository: Repository<ProductRelation>,
  ) {}

  async findRelationsByProductId(
    productId: string,
    query: ListProductRelationsQueryDto,
  ): Promise<[ProductRelation[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.productRelationRepository.findAndCount({
      where: {
        sourceProductId: productId,
        ...(query.relationType ? { relationType: query.relationType } : {}),
      },
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });
  }

  findRelationByUnique(
    sourceProductId: string,
    targetProductId: string,
    relationType: ProductRelationType,
  ): Promise<ProductRelation | null> {
    return this.productRelationRepository.findOne({
      where: {
        sourceProductId,
        targetProductId,
        relationType,
      },
    });
  }

  createProductRelation(data: Partial<ProductRelation>): ProductRelation {
    return this.productRelationRepository.create(data);
  }

  saveProductRelation(relation: ProductRelation): Promise<ProductRelation> {
    return this.productRelationRepository.save(relation);
  }

  findProductRelationById(relationId: string): Promise<ProductRelation | null> {
    return this.findRelationById(relationId);
  }

  findRelationById(relationId: string): Promise<ProductRelation | null> {
    return this.productRelationRepository.findOne({
      where: { id: relationId },
    });
  }

  async removeProductRelation(relation: ProductRelation): Promise<void> {
    await this.productRelationRepository.remove(relation);
  }
}
