// src/modules/addresses/dto/list-addresses-query.dto.ts

import { IsEnum, IsOptional } from 'class-validator';
import { AddressType } from '../../users/enums/address-type.enum';

export class ListAddressesQueryDto {
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;
}
