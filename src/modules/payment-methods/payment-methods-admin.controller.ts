// src/modules/payment-methods/payment-methods-admin.controller.ts

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
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ListPaymentMethodsQueryDto } from './dto/list-payment-methods-query.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { UpdatePaymentMethodStatusDto } from './dto/update-payment-method-status.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('admin/payment-methods')
export class PaymentMethodsAdminController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @Permissions('payment_method.read')
  listPaymentMethods(@Query() query: ListPaymentMethodsQueryDto) {
    return this.paymentMethodsService.listAdmin(query);
  }

  @Get(':paymentMethodId')
  @Permissions('payment_method.read')
  getPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    return this.paymentMethodsService.getDetail(paymentMethodId);
  }

  @Post()
  @Permissions('payment_method.create')
  createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(dto);
  }

  @Patch(':paymentMethodId')
  @Permissions('payment_method.update')
  updatePaymentMethod(
    @Param('paymentMethodId') paymentMethodId: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(paymentMethodId, dto);
  }

  @Patch(':paymentMethodId/status')
  @Permissions('payment_method.update')
  updatePaymentMethodStatus(
    @Param('paymentMethodId') paymentMethodId: string,
    @Body() dto: UpdatePaymentMethodStatusDto,
  ) {
    return this.paymentMethodsService.updateStatus(paymentMethodId, dto);
  }

  @Delete(':paymentMethodId')
  @Permissions('payment_method.delete')
  deletePaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    return this.paymentMethodsService.delete(paymentMethodId);
  }
}
