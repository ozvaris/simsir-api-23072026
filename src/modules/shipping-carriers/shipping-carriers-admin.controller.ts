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
import { CreateShippingCarrierServicePaymentCapabilityDto } from './dto/create-shipping-carrier-service-payment-capability.dto';
import { CreateShippingCarrierServiceDto } from './dto/create-shipping-carrier-service.dto';
import { ListShippingCarriersQueryDto } from './dto/list-shipping-carriers-query.dto';
import { UpdateShippingCarrierServicePaymentCapabilityDto } from './dto/update-shipping-carrier-service-payment-capability.dto';
import { UpdateShippingCarrierServicePaymentCapabilityStatusDto } from './dto/update-shipping-carrier-service-payment-capability-status.dto';
import { UpdateShippingCarrierServiceDto } from './dto/update-shipping-carrier-service.dto';
import { UpdateShippingCarrierServiceStatusDto } from './dto/update-shipping-carrier-service-status.dto';
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

  @Post(':shippingCarrierId/services')
  @Permissions('shipping_carrier.update')
  createShippingCarrierService(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Body() dto: CreateShippingCarrierServiceDto,
  ) {
    return this.shippingCarriersService.createService(shippingCarrierId, dto);
  }

  @Patch(':shippingCarrierId/services/:shippingCarrierServiceId')
  @Permissions('shipping_carrier.update')
  updateShippingCarrierService(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
    @Body() dto: UpdateShippingCarrierServiceDto,
  ) {
    return this.shippingCarriersService.updateService(
      shippingCarrierId,
      shippingCarrierServiceId,
      dto,
    );
  }

  @Patch(':shippingCarrierId/services/:shippingCarrierServiceId/status')
  @Permissions('shipping_carrier.update')
  updateShippingCarrierServiceStatus(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
    @Body() dto: UpdateShippingCarrierServiceStatusDto,
  ) {
    return this.shippingCarriersService.updateServiceStatus(
      shippingCarrierId,
      shippingCarrierServiceId,
      dto,
    );
  }

  @Delete(':shippingCarrierId/services/:shippingCarrierServiceId')
  @Permissions('shipping_carrier.delete')
  deleteShippingCarrierService(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
  ) {
    return this.shippingCarriersService.deleteService(
      shippingCarrierId,
      shippingCarrierServiceId,
    );
  }

  @Post(':shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities')
  @Permissions('shipping_carrier.update')
  createShippingCarrierServicePaymentCapability(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
    @Body() dto: CreateShippingCarrierServicePaymentCapabilityDto,
  ) {
    return this.shippingCarriersService.createPaymentCapability(
      shippingCarrierId,
      shippingCarrierServiceId,
      dto,
    );
  }

  @Patch(
    ':shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities/:shippingCarrierServicePaymentCapabilityId',
  )
  @Permissions('shipping_carrier.update')
  updateShippingCarrierServicePaymentCapability(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
    @Param('shippingCarrierServicePaymentCapabilityId')
    shippingCarrierServicePaymentCapabilityId: string,
    @Body() dto: UpdateShippingCarrierServicePaymentCapabilityDto,
  ) {
    return this.shippingCarriersService.updatePaymentCapability(
      shippingCarrierId,
      shippingCarrierServiceId,
      shippingCarrierServicePaymentCapabilityId,
      dto,
    );
  }

  @Patch(
    ':shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities/:shippingCarrierServicePaymentCapabilityId/status',
  )
  @Permissions('shipping_carrier.update')
  updateShippingCarrierServicePaymentCapabilityStatus(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
    @Param('shippingCarrierServicePaymentCapabilityId')
    shippingCarrierServicePaymentCapabilityId: string,
    @Body() dto: UpdateShippingCarrierServicePaymentCapabilityStatusDto,
  ) {
    return this.shippingCarriersService.updatePaymentCapabilityStatus(
      shippingCarrierId,
      shippingCarrierServiceId,
      shippingCarrierServicePaymentCapabilityId,
      dto,
    );
  }

  @Delete(
    ':shippingCarrierId/services/:shippingCarrierServiceId/payment-capabilities/:shippingCarrierServicePaymentCapabilityId',
  )
  @Permissions('shipping_carrier.delete')
  deleteShippingCarrierServicePaymentCapability(
    @Param('shippingCarrierId') shippingCarrierId: string,
    @Param('shippingCarrierServiceId') shippingCarrierServiceId: string,
    @Param('shippingCarrierServicePaymentCapabilityId')
    shippingCarrierServicePaymentCapabilityId: string,
  ) {
    return this.shippingCarriersService.deletePaymentCapability(
      shippingCarrierId,
      shippingCarrierServiceId,
      shippingCarrierServicePaymentCapabilityId,
    );
  }
}
