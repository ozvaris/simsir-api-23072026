// src/modules/shipping-carriers/dto/update-shipping-carrier.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateShippingCarrierDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;
}
