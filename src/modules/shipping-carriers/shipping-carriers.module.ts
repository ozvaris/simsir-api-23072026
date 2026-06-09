// src/modules/shipping-carriers/shipping-carriers.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { ShippingCarriersRepository } from './repositories/shipping-carriers.repository';
import { ShippingCarriersSeedService } from './seed/shipping-carriers-seed.service';
import { ShippingCarriersAdminController } from './shipping-carriers-admin.controller';
import { ShippingCarriersController } from './shipping-carriers.controller';
import { ShippingCarriersService } from './shipping-carriers.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingCarrier])],
  controllers: [ShippingCarriersController, ShippingCarriersAdminController],
  providers: [
    ShippingCarriersService,
    ShippingCarriersRepository,
    ShippingCarriersSeedService,
  ],
  exports: [ShippingCarriersService, ShippingCarriersRepository, TypeOrmModule],
})
export class ShippingCarriersModule {}
