import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AddressesModule } from '../addresses/addresses.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { ShippingCarriersModule } from '../shipping-carriers/shipping-carriers.module';
import { User } from '../users/entities/user.entity';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutDraft } from './entities/checkout-draft.entity';
import { CheckoutDraftsRepository } from './repositories/checkout-drafts.repository';
import { DemoCheckoutDraftSeedService } from './seed/demo-checkout-draft-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutDraft, User]),
    AddressesModule,
    PaymentMethodsModule,
    ShippingCarriersModule,
  ],
  controllers: [CheckoutController],
  providers: [
    ConfigService,
    CheckoutService,
    CheckoutDraftsRepository,
    DemoCheckoutDraftSeedService,
  ],
  exports: [CheckoutService, CheckoutDraftsRepository, TypeOrmModule],
})
export class CheckoutModule {}
