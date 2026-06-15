// src/modules/payment-methods/payment-methods.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ListPublicPaymentMethodsQueryDto } from './dto/list-public-payment-methods-query.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @Public()
  listPaymentMethods(@Query() query: ListPublicPaymentMethodsQueryDto) {
    return this.paymentMethodsService.listPublic(query);
  }
}
