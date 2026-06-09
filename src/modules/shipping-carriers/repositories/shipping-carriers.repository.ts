// src/modules/shipping-carriers/repositories/shipping-carriers.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ListShippingCarriersQueryDto } from '../dto/list-shipping-carriers-query.dto';
import { ShippingCarrier } from '../entities/shipping-carrier.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';

@Injectable()
export class ShippingCarriersRepository {
  constructor(
    @InjectRepository(ShippingCarrier)
    private readonly shippingCarrierRepository: Repository<ShippingCarrier>,
  ) {}

  findActive(): Promise<ShippingCarrier[]> {
    return this.shippingCarrierRepository.find({
      where: { status: RecordStatus.ACTIVE },
      order: { code: 'ASC' },
    });
  }

  findById(shippingCarrierId: string): Promise<ShippingCarrier | null> {
    return this.shippingCarrierRepository.findOne({
      where: { id: shippingCarrierId },
    });
  }

  findByCode(code: string): Promise<ShippingCarrier | null> {
    return this.shippingCarrierRepository.findOne({
      where: { code },
    });
  }

  findAnotherByCode(
    shippingCarrierId: string,
    code: string,
  ): Promise<ShippingCarrier | null> {
    return this.shippingCarrierRepository.findOne({
      where: {
        id: Not(shippingCarrierId),
        code,
      },
    });
  }

  async listAdmin(
    query: ListShippingCarriersQueryDto,
  ): Promise<[ShippingCarrier[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.shippingCarrierRepository
      .createQueryBuilder('shippingCarrier')
      .orderBy('shippingCarrier.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('shippingCarrier.status = :status', {
        status: query.status,
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(shippingCarrier.code ILIKE :search OR shippingCarrier.name ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    return builder.getManyAndCount();
  }

  create(data: Partial<ShippingCarrier>): ShippingCarrier {
    return this.shippingCarrierRepository.create(data);
  }

  save(carrier: ShippingCarrier): Promise<ShippingCarrier> {
    return this.shippingCarrierRepository.save(carrier);
  }

  async remove(carrier: ShippingCarrier): Promise<void> {
    await this.shippingCarrierRepository.remove(carrier);
  }
}
