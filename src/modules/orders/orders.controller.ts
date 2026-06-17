import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/types/current-user.type';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListMyOrdersQueryDto } from './dto/list-my-orders-query.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  listMyOrders(
    @CurrentUser('userId') userId: string,
    @Query() query: ListMyOrdersQueryDto,
  ) {
    return this.ordersService.listMyOrders(userId, query);
  }

  @Get(':orderId')
  getMyOrderDetail(
    @CurrentUser('userId') userId: string,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.ordersService.getMyOrderDetail(userId, orderId);
  }

  @Post()
  createOrder(@CurrentUser() user: CurrentUserType, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user, dto);
  }

  @Post(':orderId/cancel')
  cancelMyOrder(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
  ) {
    return this.ordersService.cancelMyOrder(user, orderId);
  }
}
