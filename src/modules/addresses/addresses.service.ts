// src/modules/addresses/addresses.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { ListAddressesQueryDto } from './dto/list-addresses-query.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from '../users/entities/address.entity';
import { AddressesRepository } from './repositories/addresses.repository';

type AddressResponse = {
  id: string;
  userId: string;
  type: string;
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  state: string | null;
  zip: string | null;
  addressLine1: string;
  addressLine2: string | null;
  isDefault: boolean;
};

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async listByUser(userId: string, query: ListAddressesQueryDto) {
    const addresses = await this.addressesRepository.findByUserId(
      userId,
      query.type,
    );

    return {
      items: addresses.map((address) => this.toAddressResponse(address)),
    };
  }

  async create(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponse> {
    if (dto.isDefault) {
      await this.addressesRepository.unsetDefaultForType(userId, dto.type);
    }

    const address = this.addressesRepository.createAddress({
      userId,
      type: dto.type,
      label: dto.label.trim(),
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      country: dto.country.trim(),
      city: dto.city.trim(),
      state: dto.state?.trim() || null,
      zip: dto.zip?.trim() || null,
      addressLine1: dto.addressLine1.trim(),
      addressLine2: dto.addressLine2?.trim() || null,
      isDefault: dto.isDefault ?? false,
    });

    const savedAddress = await this.addressesRepository.saveAddress(address);

    return this.toAddressResponse(savedAddress);
  }

  async update(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponse> {
    const address = await this.addressesRepository.findByIdAndUserId(
      addressId,
      userId,
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault === true) {
      await this.addressesRepository.unsetDefaultForType(
        userId,
        address.type,
        address.id,
      );
    }

    if (dto.label !== undefined) {
      address.label = dto.label.trim();
    }

    if (dto.fullName !== undefined) {
      address.fullName = dto.fullName.trim();
    }

    if (dto.phone !== undefined) {
      address.phone = dto.phone.trim();
    }

    if (dto.country !== undefined) {
      address.country = dto.country.trim();
    }

    if (dto.city !== undefined) {
      address.city = dto.city.trim();
    }

    if (dto.state !== undefined) {
      address.state = dto.state?.trim() || null;
    }

    if (dto.zip !== undefined) {
      address.zip = dto.zip?.trim() || null;
    }

    if (dto.addressLine1 !== undefined) {
      address.addressLine1 = dto.addressLine1.trim();
    }

    if (dto.addressLine2 !== undefined) {
      address.addressLine2 = dto.addressLine2?.trim() || null;
    }

    if (dto.isDefault !== undefined) {
      address.isDefault = dto.isDefault;
    }

    const savedAddress = await this.addressesRepository.saveAddress(address);

    return this.toAddressResponse(savedAddress);
  }

  async remove(userId: string, addressId: string): Promise<{ success: true }> {
    const address = await this.addressesRepository.findByIdAndUserId(
      addressId,
      userId,
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const deletedAddressType = address.type;
    const wasDefault = address.isDefault;

    await this.addressesRepository.removeAddress(address);

    if (wasDefault) {
      const nextDefault =
        await this.addressesRepository.findFirstAddressByUserAndType(
          userId,
          deletedAddressType,
        );

      if (nextDefault) {
        nextDefault.isDefault = true;
        await this.addressesRepository.saveAddress(nextDefault);
      }
    }

    return { success: true };
  }

  private toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      userId: address.userId,
      type: address.type,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      country: address.country,
      city: address.city,
      state: address.state,
      zip: address.zip,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      isDefault: address.isDefault,
    };
  }
}
