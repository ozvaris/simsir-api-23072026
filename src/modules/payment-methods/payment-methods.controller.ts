// src/modules/payment-methods/payment-methods.controller.ts

import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @Public()
  listPaymentMethods() {
    return this.paymentMethodsService.listPublic();
  }
}
