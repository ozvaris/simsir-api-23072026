import { IsOptional, IsUUID } from 'class-validator';

export class ListPublicPaymentMethodsQueryDto {
  @IsOptional()
  @IsUUID()
  shippingServiceId?: string;
}
