// src/modules/cart/repositories/carts.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartStatus } from '../enums/cart-status.enum';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  findActiveCartByUserId(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
    });
  }

  findActiveCartDetailByUserId(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  createCart(data: Partial<Cart>): Cart {
    return this.cartRepository.create(data);
  }

  saveCart(cart: Cart): Promise<Cart> {
    return this.cartRepository.save(cart);
  }

  async getOrCreateActiveCart(userId: string): Promise<Cart> {
    const existingCart = await this.findActiveCartByUserId(userId);

    if (existingCart) {
      return existingCart;
    }

    const cart = this.createCart({
      userId,
      status: CartStatus.ACTIVE,
    });

    return this.saveCart(cart);
  }

  async getOrCreateActiveCartDetail(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateActiveCart(userId);

    return (
      (await this.findActiveCartDetailByUserId(userId)) ?? {
        ...cart,
        items: [],
      }
    );
  }
}
