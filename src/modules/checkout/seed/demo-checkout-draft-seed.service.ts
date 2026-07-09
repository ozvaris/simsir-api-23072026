import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { AddressesRepository } from '../../addresses/repositories/addresses.repository';
import { ShippingOption } from '../../orders/enums/shipping-option.enum';
import { PaymentMethodsService } from '../../payment-methods/payment-methods.service';
import { ShippingCarrierServicesRepository } from '../../shipping-carriers/repositories/shipping-carrier-services.repository';
import { User } from '../../users/entities/user.entity';
import { AddressType } from '../../users/enums/address-type.enum';
import { CheckoutDraft } from '../entities/checkout-draft.entity';
import { CheckoutDraftsRepository } from '../repositories/checkout-drafts.repository';

const DEMO_CHECKOUT_DRAFT_SEED = {
  userEmail: 'customer@example.com',
  shippingOption: ShippingOption.CARRIER,
} as const;

@Injectable()
export class DemoCheckoutDraftSeedService implements OnModuleInit {
  private readonly logger = new Logger(DemoCheckoutDraftSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly checkoutDraftsRepository: CheckoutDraftsRepository,
    private readonly addressesRepository: AddressesRepository,
    private readonly shippingCarrierServicesRepository: ShippingCarrierServicesRepository,
    private readonly paymentMethodsService: PaymentMethodsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo checkout draft seed.');
      return;
    }

    await this.seedDraft();
  }

  private async seedDraft(): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: DEMO_CHECKOUT_DRAFT_SEED.userEmail },
    });

    if (!user) {
      this.logger.warn(
        `Skipping demo checkout draft; user ${DEMO_CHECKOUT_DRAFT_SEED.userEmail} was not found.`,
      );
      return;
    }

    const existingDraft = await this.checkoutDraftsRepository.findByUserId(user.id);

    if (existingDraft) {
      return;
    }

    const shippingAddress = await this.addressesRepository.findFirstAddressByUserAndType(
      user.id,
      AddressType.SHIPPING,
    );
    const billingAddress = await this.addressesRepository.findFirstAddressByUserAndType(
      user.id,
      AddressType.BILLING,
    );

    if (!shippingAddress || !billingAddress) {
      this.logger.warn(
        `Skipping demo checkout draft; default addresses for ${DEMO_CHECKOUT_DRAFT_SEED.userEmail} were not found.`,
      );
      return;
    }

    const shippingServices =
      await this.shippingCarrierServicesRepository.findActivePublic();
    const shippingService = shippingServices[0];

    if (!shippingService) {
      this.logger.warn('Skipping demo checkout draft; no active public shipping service was found.');
      return;
    }

    const paymentMethods = await this.paymentMethodsService.listPublic({
      shippingServiceId: shippingService.id,
    });
    const paymentMethod = paymentMethods.items.find(
      (item) => item.isSelectable !== false,
    );

    if (!paymentMethod) {
      this.logger.warn(
        `Skipping demo checkout draft; no selectable payment method was found for shipping service ${shippingService.id}.`,
      );
      return;
    }

    const draft = this.checkoutDraftsRepository.create({
      userId: user.id,
      shippingOption: DEMO_CHECKOUT_DRAFT_SEED.shippingOption,
      shippingServiceId: shippingService.id,
      shippingAddressId: shippingAddress.id,
      billingAddressId: billingAddress.id,
      sameAsShipping: false,
      paymentMethodId: paymentMethod.id,
    });

    await this.checkoutDraftsRepository.save(draft);
  }
}
