import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ShippingOption } from '../../orders/enums/shipping-option.enum';

export class UpdateCheckoutDraftDto {
  @IsOptional()
  @IsEnum(ShippingOption)
  shippingOption?: ShippingOption | null;

  @IsOptional()
  @IsUUID()
  shippingServiceId?: string | null;

  @IsOptional()
  @IsUUID()
  shippingAddressId?: string | null;

  @IsOptional()
  @IsUUID()
  billingAddressId?: string | null;

  @IsOptional()
  @IsBoolean()
  sameAsShipping?: boolean;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string | null;
}
