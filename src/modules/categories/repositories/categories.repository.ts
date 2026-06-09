// src/modules/categories/repositories/categories.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { Product } from '../../products/entities/product.entity';
import { ListCategoriesQueryDto } from '../dto/list-categories-query.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  findPublicList(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        status: RecordStatus.ACTIVE,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findAdminList(
    query: ListCategoriesQueryDto,
  ): Promise<[Category[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.categoryRepository
      .createQueryBuilder('category')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('category.status = :status', {
        status: query.status,
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(category.slug ILIKE :search OR category.name ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    return builder.getManyAndCount();
  }

  findById(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        slug,
      },
    });
  }

  findAnotherBySlug(
    categoryId: string,
    slug: string,
  ): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        id: Not(categoryId),
        slug,
      },
    });
  }

  create(data: Partial<Category>): Category {
    return this.categoryRepository.create(data);
  }

  save(category: Category): Promise<Category> {
    return this.categoryRepository.save(category);
  }

  async remove(category: Category): Promise<void> {
    await this.categoryRepository.remove(category);
  }

  countChildren(categoryId: string): Promise<number> {
    return this.categoryRepository.count({
      where: {
        parentId: categoryId,
      },
    });
  }

  countProducts(categoryId: string): Promise<number> {
    return this.categoryRepository.manager.getRepository(Product).count({
      where: {
        categoryId,
      },
    });
  }

  findPublicBySlugWithProducts(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        slug,
        status: RecordStatus.ACTIVE,
      },
      relations: {
        products: true,
      },
    });
  }

  findPublicBySlugWithParentAndChildren(
    slug: string,
  ): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        slug,
        status: RecordStatus.ACTIVE,
      },
      relations: {
        parent: true,
        children: true,
      },
      order: {
        children: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      },
    });
  }

  findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        parentId: IsNull(),
        status: RecordStatus.ACTIVE,
      },
      relations: {
        children: true,
      },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
        children: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      },
    });
  }

  findByIdWithChildren(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
      relations: {
        children: true,
      },
    });
  }

  findBySlugWithChildren(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: {
        slug,
      },
      relations: {
        children: true,
        parent: true,
      },
    });
  }
}
