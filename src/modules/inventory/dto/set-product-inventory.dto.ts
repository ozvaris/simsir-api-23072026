import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SetProductInventoryDto {
  @IsInt()
  @Min(0)
  onHandQuantity!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note?: string;
}
