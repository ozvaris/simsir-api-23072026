// src/modules/shipping-carriers/seed/shipping-carriers-seed.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarriersRepository } from '../repositories/shipping-carriers.repository';

const SHIPPING_CARRIER_SEEDS = [
  {
    code: 'standard',
    name: 'Standard Shipping',
    fee: '4.99',
  },
  {
    code: 'express',
    name: 'Express Shipping',
    fee: '9.99',
  },
  {
    code: 'pickup',
    name: 'Store Pickup',
    fee: '0.00',
  },
] as const;

@Injectable()
export class ShippingCarriersSeedService implements OnModuleInit {
  constructor(
    private readonly shippingCarriersRepository: ShippingCarriersRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const seed of SHIPPING_CARRIER_SEEDS) {
      const existingCarrier = await this.shippingCarriersRepository.findByCode(
        seed.code,
      );

      if (existingCarrier) {
        continue;
      }

      await this.shippingCarriersRepository.save(
        this.shippingCarriersRepository.create({
          ...seed,
          status: RecordStatus.ACTIVE,
        }),
      );
    }
  }
}
