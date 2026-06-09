// src/modules/product-media/dto/update-product-media.dto.ts

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductMediaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  src?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
