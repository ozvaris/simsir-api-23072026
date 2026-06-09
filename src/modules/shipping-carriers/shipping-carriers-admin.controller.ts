// src/modules/shipping-carriers/shipping-carriers-admin.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateShippingCarrierDto } from './dto/create-shipping-carrier.dto';
import { ListShippingCarriersQueryDto } from './dto/list-shipping-carriers-query.dto';
import { UpdateShippingCarrierDto } from './dto/update-shipping-carrier.dto';
import { UpdateShippingCarrierStatusDto } from './dto/update-shipping-carrier-status.dto';
import { ShippingCarriersService } from './shipping-carriers.service';

@Controller('admin/shipping-carriers')
export class ShippingCarriersAdminController {
  constructor(
    private readonly shippingCarriersService: ShippingCarriersService,
  ) {}

  @Get()
  @Permissions('shipping_carrier.read')
  listShippingCarriers(@Query() query: ListShippingCarriersQueryDto) {
    return this.shippingCarriersService.listAdmin(query);
  }

  @Get(':shippingCarrierId')
  @Permissions('shipping_carrier.read')
  getShippingCarrier(@Param('shippingCarrierId') shippingCarrierId: string) {
    return this.shippingCarriersService.getDetail(shippingCarrierId);
  }

  @Post()
  @Permissions('shipping_carrier.create')
  createShippingCarrier(@Body() dto: CreateShippingCarrierDto) {
    return this.shippingCarriersService.create(dto);
  }

  @Patch(':shippingCarrierId')
  @Permissions('shipping_carrier.update')
  updateShippingCarrier(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Body() dto: UpdateShippingCarrierDto,
  ) {
    return this.shippingCarriersService.update(shippingCarrierId, dto);
  }

  @Patch(':shippingCarrierId/status')
  @Permissions('shipping_carrier.update')
  updateShippingCarrierStatus(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Body() dto: UpdateShippingCarrierStatusDto,
  ) {
    return this.shippingCarriersService.updateStatus(shippingCarrierId, dto);
  }

  @Delete(':shippingCarrierId')
  @Permissions('shipping_carrier.delete')
  deleteShippingCarrier(@Param('shippingCarrierId') shippingCarrierId: string) {
    return this.shippingCarriersService.delete(shippingCarrierId);
  }
}
