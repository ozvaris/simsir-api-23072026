// src/modules/payment-methods/dto/update-payment-method.dto.ts

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name?: string;
}
