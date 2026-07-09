// src/modules/shipping-carriers/shipping-carriers.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { ShippingCarrierServicePaymentCapability } from './entities/shipping-carrier-service-payment-capability.entity';
import { ShippingCarrierService } from './entities/shipping-carrier-service.entity';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { ShippingCarrierServicePaymentCapabilitiesRepository } from './repositories/shipping-carrier-service-payment-capabilities.repository';
import { ShippingCarrierServicesRepository } from './repositories/shipping-carrier-services.repository';
import { ShippingCarriersRepository } from './repositories/shipping-carriers.repository';
import { ShippingCarriersSeedService } from './seed/shipping-carriers-seed.service';
import { ShippingCarriersAdminController } from './shipping-carriers-admin.controller';
import { ShippingCarriersController } from './shipping-carriers.controller';
import { ShippingCarriersService } from './shipping-carriers.service';

@Module({
  imports: [
    SystemSettingsModule,
    TypeOrmModule.forFeature([
      ShippingCarrier,
      ShippingCarrierService,
      ShippingCarrierServicePaymentCapability,
    ]),
  ],
  controllers: [ShippingCarriersController, ShippingCarriersAdminController],
  providers: [
    ShippingCarriersService,
    ShippingCarriersRepository,
    ShippingCarrierServicesRepository,
    ShippingCarrierServicePaymentCapabilitiesRepository,
    ShippingCarriersSeedService,
  ],
  exports: [
    ShippingCarriersService,
    ShippingCarriersRepository,
    ShippingCarrierServicesRepository,
    TypeOrmModule,
  ],
})
export class ShippingCarriersModule {}
