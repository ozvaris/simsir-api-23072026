// src/modules/cart/cart.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { toCartResponse } from './mappers/cart.mapper';
import { CartItemsRepository } from './repositories/cart-items.repository';
import { CartsRepository } from './repositories/carts.repository';
import { CartResponse } from './responses/cart.response';

@Injectable()
export class CartService {
  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly cartItemsRepository: CartItemsRepository,
  ) {}

  async getMyCart(userId: string): Promise<CartResponse> {
    const cart = await this.cartsRepository.getOrCreateActiveCartDetail(userId);

    return toCartResponse(cart);
  }

  async addItemToMyCart(
    userId: string,
    dto: AddCartItemDto,
  ): Promise<CartResponse> {
    const product = await this.cartItemsRepository.findProductById(
      dto.productId,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.cartsRepository.getOrCreateActiveCart(userId);
    const existingItem =
      await this.cartItemsRepository.findByCartIdAndProductId(
        cart.id,
        dto.productId,
      );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      await this.cartItemsRepository.saveItem(existingItem);
    } else {
      const item = this.cartItemsRepository.createItem({
        cartId: cart.id,
        productId: product.id,
        quantity: dto.quantity,
      });

      await this.cartItemsRepository.saveItem(item);
    }

    return this.getMyCart(userId);
  }

  async updateMyCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const item = await this.cartItemsRepository.findByIdAndUserId(
      itemId,
      userId,
    );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = dto.quantity;
    await this.cartItemsRepository.saveItem(item);

    return this.getMyCart(userId);
  }

  async removeMyCartItem(
    userId: string,
    itemId: string,
  ): Promise<{ success: true }> {
    const item = await this.cartItemsRepository.findByIdAndUserId(
      itemId,
      userId,
    );

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemsRepository.deleteByCartItemId(item.id);

    return { success: true };
  }

  async clearMyCart(userId: string): Promise<{ success: true }> {
    const cart = await this.cartsRepository.getOrCreateActiveCart(userId);

    await this.cartItemsRepository.deleteByCartId(cart.id);

    return { success: true };
  }
}
