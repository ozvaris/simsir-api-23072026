// src/modules/addresses/repositories/addresses.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../users/entities/address.entity';
import { AddressType } from '../../users/enums/address-type.enum';

@Injectable()
export class AddressesRepository {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  findByUserId(userId: string, type?: AddressType): Promise<Address[]> {
    return this.addressRepository.find({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  findByIdAndUserId(
    addressId: string,
    userId: string,
  ): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: {
        id: addressId,
        userId,
      },
    });
  }

  createAddress(data: Partial<Address>): Address {
    return this.addressRepository.create(data);
  }

  saveAddress(address: Address): Promise<Address> {
    return this.addressRepository.save(address);
  }

  async unsetDefaultForType(
    userId: string,
    type: AddressType,
    exceptAddressId?: string,
  ): Promise<void> {
    const query = this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('"userId" = :userId', { userId })
      .andWhere('type = :type', { type });

    if (exceptAddressId) {
      query.andWhere('id != :exceptAddressId', { exceptAddressId });
    }

    await query.execute();
  }

  async removeAddress(address: Address): Promise<void> {
    await this.addressRepository.remove(address);
  }

  findFirstAddressByUserAndType(
    userId: string,
    type: AddressType,
  ): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: {
        userId,
        type,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
