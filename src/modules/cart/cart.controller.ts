// src/modules/cart/cart.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getMyCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItemToMyCart(userId, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @CurrentUser('userId') userId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateMyCartItem(userId, itemId, dto);
  }

  @Delete('items/:itemId')
  removeItem(
    @CurrentUser('userId') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeMyCartItem(userId, itemId);
  }

  @Delete()
  clearCart(@CurrentUser('userId') userId: string) {
    return this.cartService.clearMyCart(userId);
  }
}
