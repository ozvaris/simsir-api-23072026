// src/modules/payment-methods/mappers/payment-methods.mapper.ts

import { PaymentProvider } from '../entities/payment-provider.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodResponse } from '../responses/payment-method.response';
import { PaymentProviderResponse } from '../responses/payment-provider.response';

export function toPaymentProviderResponse(
  paymentProvider: PaymentProvider,
): PaymentProviderResponse {
  return {
    id: paymentProvider.id,
    code: paymentProvider.code,
    name: paymentProvider.name,
    providerType: paymentProvider.providerType,
    description: paymentProvider.description,
    logoUrl: paymentProvider.logoUrl,
    sortOrder: paymentProvider.sortOrder,
    status: paymentProvider.status,
  };
}

export function toPaymentMethodResponse(
  paymentMethod: PaymentMethod,
): PaymentMethodResponse {
  const providers =
    paymentMethod.providers
      ?.slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(toPaymentProviderResponse) ?? [];

  return {
    id: paymentMethod.id,
    code: paymentMethod.code,
    name: paymentMethod.name,
    status: paymentMethod.status,
    providers,
    extraFee: null,
    currency: null,
    minOrderAmount: null,
    maxOrderAmount: null,
  };
}
