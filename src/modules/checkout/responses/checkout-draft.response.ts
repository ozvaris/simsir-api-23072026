import { ShippingOption } from '../../orders/enums/shipping-option.enum';

export class CheckoutDraftResponse {
  shippingOption!: ShippingOption | null;
  shippingServiceId!: string | null;
  shippingAddressId!: string | null;
  billingAddressId!: string | null;
  sameAsShipping!: boolean;
  paymentMethodId!: string | null;
}
