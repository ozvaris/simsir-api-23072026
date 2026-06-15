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
import { CreatePaymentProviderDto } from './dto/create-payment-provider.dto';
import { ListPaymentMethodsQueryDto } from './dto/list-payment-methods-query.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { UpdatePaymentMethodStatusDto } from './dto/update-payment-method-status.dto';
import { UpdatePaymentProviderDto } from './dto/update-payment-provider.dto';
import { UpdatePaymentProviderStatusDto } from './dto/update-payment-provider-status.dto';
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

  @Post(':paymentMethodId/providers')
  @Permissions('payment_method.update')
  createPaymentProvider(
    @Param('paymentMethodId') paymentMethodId: string,
    @Body() dto: CreatePaymentProviderDto,
  ) {
    return this.paymentMethodsService.createProvider(paymentMethodId, dto);
  }

  @Patch(':paymentMethodId/providers/:paymentProviderId')
  @Permissions('payment_method.update')
  updatePaymentProvider(
    @Param('paymentMethodId') paymentMethodId: string,
    @Param('paymentProviderId') paymentProviderId: string,
    @Body() dto: UpdatePaymentProviderDto,
  ) {
    return this.paymentMethodsService.updateProvider(
      paymentMethodId,
      paymentProviderId,
      dto,
    );
  }

  @Patch(':paymentMethodId/providers/:paymentProviderId/status')
  @Permissions('payment_method.update')
  updatePaymentProviderStatus(
    @Param('paymentMethodId') paymentMethodId: string,
    @Param('paymentProviderId') paymentProviderId: string,
    @Body() dto: UpdatePaymentProviderStatusDto,
  ) {
    return this.paymentMethodsService.updateProviderStatus(
      paymentMethodId,
      paymentProviderId,
      dto,
    );
  }

  @Delete(':paymentMethodId/providers/:paymentProviderId')
  @Permissions('payment_method.delete')
  deletePaymentProvider(
    @Param('paymentMethodId') paymentMethodId: string,
    @Param('paymentProviderId') paymentProviderId: string,
  ) {
    return this.paymentMethodsService.deleteProvider(
      paymentMethodId,
      paymentProviderId,
    );
  }
}
