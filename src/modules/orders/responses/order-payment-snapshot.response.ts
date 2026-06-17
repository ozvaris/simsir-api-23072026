export class OrderPaymentSnapshotResponse {
  paymentMethodId!: string | null;
  paymentMethodCodeSnapshot!: string;
  paymentMethodNameSnapshot!: string;
  paymentProviderId!: string | null;
  paymentProviderCodeSnapshot!: string | null;
  paymentProviderNameSnapshot!: string | null;
  paymentProviderTypeSnapshot!: string | null;
  providerConfigSnapshot!: Record<string, unknown> | null;
}
