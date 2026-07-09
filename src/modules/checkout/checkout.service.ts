import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AddressesRepository } from '../addresses/repositories/addresses.repository';
import { ShippingOption } from '../orders/enums/shipping-option.enum';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { ShippingCarrierServicesRepository } from '../shipping-carriers/repositories/shipping-carrier-services.repository';
import { AddressType } from '../users/enums/address-type.enum';
import { UpdateCheckoutDraftDto } from './dto/update-checkout-draft.dto';
import { CheckoutDraft } from './entities/checkout-draft.entity';
import { toCheckoutDraftResponse } from './mappers/checkout-draft.mapper';
import { CheckoutDraftsRepository } from './repositories/checkout-drafts.repository';
import { CheckoutDraftResponse } from './responses/checkout-draft.response';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutDraftsRepository: CheckoutDraftsRepository,
    private readonly addressesRepository: AddressesRepository,
    private readonly shippingCarrierServicesRepository: ShippingCarrierServicesRepository,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async getMyDraft(userId: string): Promise<CheckoutDraftResponse> {
    const draft = await this.getOrCreateDraft(userId);

    return toCheckoutDraftResponse(draft);
  }

  async updateMyDraft(
    userId: string,
    dto: UpdateCheckoutDraftDto,
  ): Promise<CheckoutDraftResponse> {
    const draft = await this.getOrCreateDraft(userId);
    const paymentMethodTouched = 'paymentMethodId' in dto;

    if ('shippingOption' in dto) {
      draft.shippingOption = dto.shippingOption ?? null;
    }

    if ('shippingServiceId' in dto) {
      draft.shippingServiceId = dto.shippingServiceId ?? null;
    }

    if ('shippingAddressId' in dto) {
      draft.shippingAddressId = dto.shippingAddressId ?? null;
    }

    if ('billingAddressId' in dto) {
      draft.billingAddressId = dto.billingAddressId ?? null;
    }

    if ('sameAsShipping' in dto && dto.sameAsShipping !== undefined) {
      draft.sameAsShipping = dto.sameAsShipping;
    }

    if ('paymentMethodId' in dto) {
      draft.paymentMethodId = dto.paymentMethodId ?? null;
    }

    this.normalizeDraft(draft);
    await this.validateDraft(userId, draft, paymentMethodTouched);

    const savedDraft = await this.checkoutDraftsRepository.save(draft);

    return toCheckoutDraftResponse(savedDraft);
  }

  private async getOrCreateDraft(userId: string): Promise<CheckoutDraft> {
    const existingDraft = await this.checkoutDraftsRepository.findByUserId(userId);

    if (existingDraft) {
      return existingDraft;
    }

    const createdDraft = this.checkoutDraftsRepository.create({
      userId,
      shippingOption: null,
      shippingServiceId: null,
      shippingAddressId: null,
      billingAddressId: null,
      sameAsShipping: true,
      paymentMethodId: null,
    });

    return this.checkoutDraftsRepository.save(createdDraft);
  }

  private normalizeDraft(draft: CheckoutDraft): void {
    if (draft.shippingOption === ShippingOption.PICKUP) {
      draft.shippingAddressId = null;
    }

    if (draft.sameAsShipping) {
      draft.billingAddressId = null;
    }
  }

  private async validateDraft(
    userId: string,
    draft: CheckoutDraft,
    paymentMethodTouched: boolean,
  ): Promise<void> {
    if (draft.shippingServiceId) {
      const shippingService =
        await this.shippingCarrierServicesRepository.findActivePublicById(
          draft.shippingServiceId,
        );

      if (!shippingService) {
        throw new NotFoundException('Shipping service not found');
      }
    }

    if (draft.shippingAddressId) {
      const shippingAddress = await this.addressesRepository.findByIdAndUserId(
        draft.shippingAddressId,
        userId,
      );

      if (!shippingAddress || shippingAddress.type !== AddressType.SHIPPING) {
        throw new NotFoundException('Shipping address not found');
      }
    }

    if (draft.billingAddressId) {
      const billingAddress = await this.addressesRepository.findByIdAndUserId(
        draft.billingAddressId,
        userId,
      );

      if (!billingAddress || billingAddress.type !== AddressType.BILLING) {
        throw new NotFoundException('Billing address not found');
      }
    }

    if (draft.paymentMethodId) {
      await this.reconcilePaymentMethod(draft, paymentMethodTouched);
    }
  }

  private async reconcilePaymentMethod(
    draft: CheckoutDraft,
    strict: boolean,
  ): Promise<void> {
    if (!draft.paymentMethodId) {
      return;
    }

    const availablePaymentMethods = await this.paymentMethodsService.listPublic({
      shippingServiceId: draft.shippingServiceId ?? undefined,
    });
    const paymentMethod = availablePaymentMethods.items.find(
      (item) => item.id === draft.paymentMethodId,
    );

    if (!paymentMethod || paymentMethod.isSelectable === false) {
      if (strict) {
        throw new ConflictException(
          'Selected payment method is not available for the chosen shipping service',
        );
      }

      draft.paymentMethodId = null;
    }
  }
}
