// src/modules/payment-methods/seed/payment-methods-seed.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { PaymentMethodsRepository } from '../repositories/payment-methods.repository';

const PAYMENT_METHOD_SEEDS = [
  {
    code: 'credit_card',
    name: 'Credit Card',
  },
  {
    code: 'bank_transfer',
    name: 'Bank Transfer',
  },
  {
    code: 'cash_on_delivery',
    name: 'Cash on Delivery',
  },
] as const;

@Injectable()
export class PaymentMethodsSeedService implements OnModuleInit {
  constructor(
    private readonly paymentMethodsRepository: PaymentMethodsRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const seed of PAYMENT_METHOD_SEEDS) {
      const existingPaymentMethod =
        await this.paymentMethodsRepository.findByCode(seed.code);

      if (existingPaymentMethod) {
        continue;
      }

      await this.paymentMethodsRepository.save(
        this.paymentMethodsRepository.create({
          ...seed,
          status: RecordStatus.ACTIVE,
        }),
      );
    }
  }
}
