import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { ShippingCarrierServicePaymentCapability } from '../entities/shipping-carrier-service-payment-capability.entity';
import { ShippingCarrierService } from '../entities/shipping-carrier-service.entity';
import { ShippingCarrier } from '../entities/shipping-carrier.entity';
import {
  ShippingCarrierPublicPaymentCollectionFeeResponse,
  ShippingCarrierPublicResponse,
} from '../responses/shipping-carrier-public.response';
import { ShippingCarrierResponse } from '../responses/shipping-carrier.response';
import { ShippingCarrierServicePaymentCapabilityResponse } from '../responses/shipping-carrier-service-payment-capability.response';
import { ShippingCarrierServiceResponse } from '../responses/shipping-carrier-service.response';

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function toPaymentCapabilityResponse(
  paymentCapability: ShippingCarrierServicePaymentCapability,
): ShippingCarrierServicePaymentCapabilityResponse {
  return {
    id: paymentCapability.id,
    paymentMethod: paymentCapability.paymentMethod,
    fee: toNumber(paymentCapability.fee),
    currency: paymentCapability.currency,
    minOrderAmount: paymentCapability.minOrderAmount
      ? toNumber(paymentCapability.minOrderAmount)
      : null,
    maxOrderAmount: paymentCapability.maxOrderAmount
      ? toNumber(paymentCapability.maxOrderAmount)
      : null,
    sortOrder: paymentCapability.sortOrder,
    status: paymentCapability.status,
  };
}

function toServiceResponse(
  shippingCarrierService: ShippingCarrierService,
): ShippingCarrierServiceResponse {
  const paymentCapabilities =
    shippingCarrierService.paymentCapabilities
      ?.slice()
      .sort((left, right) => left.sortOrder - right.sortOrder) ?? [];

  return {
    id: shippingCarrierService.id,
    code: shippingCarrierService.code,
    name: shippingCarrierService.name,
    description: shippingCarrierService.description,
    price: toNumber(shippingCarrierService.price),
    currency: shippingCarrierService.currency,
    estimatedDeliveryText: shippingCarrierService.estimatedDeliveryText,
    sortOrder: shippingCarrierService.sortOrder,
    status: shippingCarrierService.status,
    paymentCapabilities: paymentCapabilities.map(toPaymentCapabilityResponse),
  };
}

export function toShippingCarrierResponse(
  carrier: ShippingCarrier,
): ShippingCarrierResponse {
  const services =
    carrier.services
      ?.slice()
      .sort((left, right) => left.sortOrder - right.sortOrder) ?? [];

  return {
    id: carrier.id,
    code: carrier.code,
    name: carrier.name,
    description: carrier.description,
    logoUrl: carrier.logoUrl,
    sortOrder: carrier.sortOrder,
    status: carrier.status,
    services: services.map(toServiceResponse),
  };
}

export function toShippingCarrierPublicResponse(
  shippingCarrierService: ShippingCarrierService,
): ShippingCarrierPublicResponse {
  const paymentCapabilities =
    shippingCarrierService.paymentCapabilities
      ?.slice()
      .sort((left, right) => left.sortOrder - right.sortOrder) ?? [];

  const supportedPaymentMethods = paymentCapabilities.map(
    (paymentCapability) => paymentCapability.paymentMethod,
  );

  const paymentCollectionFees: ShippingCarrierPublicPaymentCollectionFeeResponse[] =
    paymentCapabilities.map((paymentCapability) => ({
      paymentMethod: paymentCapability.paymentMethod,
      fee: toNumber(paymentCapability.fee),
      currency: paymentCapability.currency,
      minOrderAmount: paymentCapability.minOrderAmount
        ? toNumber(paymentCapability.minOrderAmount)
        : null,
      maxOrderAmount: paymentCapability.maxOrderAmount
        ? toNumber(paymentCapability.maxOrderAmount)
        : null,
    }));

  return {
    id: shippingCarrierService.id,
    code: shippingCarrierService.shippingCarrier.code,
    name: shippingCarrierService.shippingCarrier.name,
    fee: toNumber(shippingCarrierService.price),
    status: shippingCarrierService.status,
    carrierId: shippingCarrierService.shippingCarrierId,
    carrierCode: shippingCarrierService.shippingCarrier.code,
    carrierName: shippingCarrierService.shippingCarrier.name,
    serviceCode: shippingCarrierService.code,
    serviceName: shippingCarrierService.name,
    price: toNumber(shippingCarrierService.price),
    currency: shippingCarrierService.currency,
    estimatedDeliveryText: shippingCarrierService.estimatedDeliveryText,
    supportedPaymentMethods: supportedPaymentMethods.filter(
      (value, index, array) => array.indexOf(value) === index,
    ) as PaymentMethodCode[],
    paymentCollectionFees,
  };
}
