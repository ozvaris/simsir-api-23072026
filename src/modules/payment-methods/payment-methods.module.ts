// src/modules/payment-methods/payment-methods.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsAdminController } from './payment-methods-admin.controller';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsRepository } from './repositories/payment-methods.repository';
import { PaymentMethodsSeedService } from './seed/payment-methods-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodsController, PaymentMethodsAdminController],
  providers: [
    PaymentMethodsService,
    PaymentMethodsRepository,
    PaymentMethodsSeedService,
  ],
  exports: [PaymentMethodsService, PaymentMethodsRepository, TypeOrmModule],
})
export class PaymentMethodsModule {}
