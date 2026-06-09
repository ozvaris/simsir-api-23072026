// src/modules/addresses/addresses.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { ListAddressesQueryDto } from './dto/list-addresses-query.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users/me/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  listMyAddresses(
    @CurrentUser('userId') userId: string,
    @Query() query: ListAddressesQueryDto,
  ) {
    return this.addressesService.listByUser(userId, query);
  }

  @Post()
  createMyAddress(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(userId, dto);
  }

  @Patch(':addressId')
  updateMyAddress(
    @CurrentUser('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(userId, addressId, dto);
  }

  @Delete(':addressId')
  deleteMyAddress(
    @CurrentUser('userId') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.addressesService.remove(userId, addressId);
  }
}
