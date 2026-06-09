// src/modules/cart/repositories/cart-items.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { CartStatus } from '../enums/cart-status.enum';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  findProductById(productId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id: productId },
    });
  }

  findByCartIdAndProductId(
    cartId: string,
    productId: string,
  ): Promise<CartItem | null> {
    return this.cartItemRepository.findOne({
      where: {
        cartId,
        productId,
      },
    });
  }

  findByIdAndUserId(itemId: string, userId: string): Promise<CartItem | null> {
    return this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          userId,
          status: CartStatus.ACTIVE,
        },
      },
      relations: {
        cart: true,
        product: true,
      },
    });
  }

  createItem(data: Partial<CartItem>): CartItem {
    return this.cartItemRepository.create(data);
  }

  saveItem(item: CartItem): Promise<CartItem> {
    return this.cartItemRepository.save(item);
  }

  async deleteByCartItemId(itemId: string): Promise<void> {
    await this.cartItemRepository.delete({ id: itemId });
  }

  async deleteByCartId(cartId: string): Promise<void> {
    await this.cartItemRepository.delete({ cartId });
  }
}
