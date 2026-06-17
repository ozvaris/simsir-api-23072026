import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  shippingAddressId!: string;

  @IsUUID()
  billingAddressId!: string;

  @IsUUID()
  shippingServiceId!: string;

  @IsUUID()
  paymentMethodId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
