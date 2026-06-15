// src/modules/addresses/seed/demo-addresses-seed.service.ts

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { Address } from '../../users/entities/address.entity';
import { User } from '../../users/entities/user.entity';
import { AddressType } from '../../users/enums/address-type.enum';

export const DEMO_ADDRESS_SEEDS = [
  {
    userEmail: 'customer@example.com',
    type: AddressType.SHIPPING,
    label: 'Demo Shipping Address',
    fullName: 'Demo Customer',
    phone: '+15550001001',
    country: 'United States',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    addressLine1: '100 Demo Market Street',
    addressLine2: 'Suite 10',
    isDefault: true,
  },
  {
    userEmail: 'customer@example.com',
    type: AddressType.BILLING,
    label: 'Demo Billing Address',
    fullName: 'Demo Customer',
    phone: '+15550001001',
    country: 'United States',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    addressLine1: '100 Demo Market Street',
    addressLine2: 'Suite 10',
    isDefault: true,
  },
] as const;

@Injectable()
export class DemoAddressesSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoAddressesSeedService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo address seed.');
      return;
    }

    await this.seedAddresses();
  }

  private async seedAddresses(): Promise<void> {
    for (const seed of DEMO_ADDRESS_SEEDS) {
      const user = await this.userRepository.findOne({
        where: { email: seed.userEmail },
      });

      if (!user) {
        this.logger.warn(
          `Skipping demo address ${seed.label}; user ${seed.userEmail} was not found.`,
        );
        continue;
      }

      const existingAddress = await this.addressRepository.findOne({
        where: {
          userId: user.id,
          type: seed.type,
          label: seed.label,
        },
      });

      if (existingAddress) {
        continue;
      }

      if (seed.isDefault) {
        await this.addressRepository.update(
          {
            userId: user.id,
            type: seed.type,
          },
          {
            isDefault: false,
          },
        );
      }

      await this.addressRepository.save(
        this.addressRepository.create({
          userId: user.id,
          type: seed.type,
          label: seed.label,
          fullName: seed.fullName,
          phone: seed.phone,
          country: seed.country,
          city: seed.city,
          state: seed.state,
          zip: seed.zip,
          addressLine1: seed.addressLine1,
          addressLine2: seed.addressLine2,
          isDefault: seed.isDefault,
        }),
      );
    }
  }
}
