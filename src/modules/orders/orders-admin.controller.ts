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
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/types/current-user.type';
import { ListAdminOrdersQueryDto } from './dto/list-admin-orders-query.dto';
import { OrderAdminActionDto } from './dto/order-admin-action.dto';
import { OrdersService } from './orders.service';

@Controller('admin/orders')
export class OrdersAdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Permissions('order.read_all')
  listOrders(@Query() query: ListAdminOrdersQueryDto) {
    return this.ordersService.listAdminOrders(query);
  }

  @Get(':orderId')
  @Permissions('order.read_all')
  getOrderDetail(@Param('orderId', new ParseUUIDPipe()) orderId: string) {
    return this.ordersService.getAdminOrderDetail(orderId);
  }

  @Post(':orderId/confirm')
  @Permissions('order.update_status')
  confirmOrder(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.confirmOrderByAdmin(user, orderId, dto);
  }

  @Post(':orderId/ready-for-shipment')
  @Permissions('order.update_status')
  markReadyForShipment(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.markReadyForShipmentByAdmin(user, orderId, dto);
  }

  @Post(':orderId/hand-over')
  @Permissions('order.update_status')
  handOverOrder(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.handOverOrderByAdmin(user, orderId, dto);
  }

  @Post(':orderId/deliver')
  @Permissions('order.update_status')
  markDelivered(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.markDeliveredByAdmin(user, orderId, dto);
  }

  @Post(':orderId/delivery-failed')
  @Permissions('order.update_status')
  markDeliveryFailed(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.markDeliveryFailedByAdmin(user, orderId, dto);
  }

  @Post(':orderId/return')
  @Permissions('order.update_status')
  markReturned(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.markReturnedByAdmin(user, orderId, dto);
  }

  @Post(':orderId/restock-returned-items')
  @Permissions('order.update_status')
  restockReturnedItems(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.restockReturnedItemsByAdmin(user, orderId, dto);
  }

  @Post(':orderId/cancel')
  @Permissions('order.cancel')
  cancelOrder(
    @CurrentUser() user: CurrentUserType,
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @Body() dto: OrderAdminActionDto,
  ) {
    return this.ordersService.cancelOrderByAdmin(user, orderId, dto);
  }
}
