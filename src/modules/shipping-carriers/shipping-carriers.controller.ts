// src/modules/shipping-carriers/shipping-carriers.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ShippingCarriersService } from './shipping-carriers.service';

@Controller('shipping-carriers')
export class ShippingCarriersController {
  constructor(
    private readonly shippingCarriersService: ShippingCarriersService,
  ) {}

  @Get()
  @Public()
  listShippingCarriers() {
    return this.shippingCarriersService.listPublic();
  }
}
