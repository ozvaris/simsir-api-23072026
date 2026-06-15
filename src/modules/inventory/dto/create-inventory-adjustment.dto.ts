import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { InventoryTransactionType } from '../enums/inventory-transaction-type.enum';

export class CreateInventoryAdjustmentDto {
  @IsEnum(InventoryTransactionType)
  type!: InventoryTransactionType;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note?: string;
}
