import { CheckoutDraft } from '../entities/checkout-draft.entity';
import { CheckoutDraftResponse } from '../responses/checkout-draft.response';

export function toCheckoutDraftResponse(
  draft: CheckoutDraft,
): CheckoutDraftResponse {
  return {
    shippingOption: draft.shippingOption,
    shippingServiceId: draft.shippingServiceId,
    shippingAddressId: draft.shippingAddressId,
    billingAddressId: draft.billingAddressId,
    sameAsShipping: draft.sameAsShipping,
    paymentMethodId: draft.paymentMethodId,
  };
}
