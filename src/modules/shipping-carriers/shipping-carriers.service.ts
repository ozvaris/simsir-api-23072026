// src/modules/shipping-carriers/shipping-carriers.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { CreateShippingCarrierDto } from './dto/create-shipping-carrier.dto';
import { ListShippingCarriersQueryDto } from './dto/list-shipping-carriers-query.dto';
import { UpdateShippingCarrierDto } from './dto/update-shipping-carrier.dto';
import { UpdateShippingCarrierStatusDto } from './dto/update-shipping-carrier-status.dto';
import { toShippingCarrierResponse } from './mappers/shipping-carriers.mapper';
import { ShippingCarriersRepository } from './repositories/shipping-carriers.repository';
import { ShippingCarrierListResponse } from './responses/shipping-carrier-list.response';
import { OperationResultResponse } from './responses/operation-result.response';
import { ShippingCarrierResponse } from './responses/shipping-carrier.response';

@Injectable()
export class ShippingCarriersService {
  constructor(
    private readonly shippingCarriersRepository: ShippingCarriersRepository,
  ) {}

  async listPublic(): Promise<
    ShippingCarrierListResponse<ShippingCarrierResponse>
  > {
    const carriers = await this.shippingCarriersRepository.findActive();

    return new ShippingCarrierListResponse({
      items: carriers.map(toShippingCarrierResponse),
    });
  }

  async listAdmin(
    query: ListShippingCarriersQueryDto,
  ): Promise<ShippingCarrierListResponse<ShippingCarrierResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [carriers, totalItems] =
      await this.shippingCarriersRepository.listAdmin(query);

    return new ShippingCarrierListResponse({
      items: carriers.map(toShippingCarrierResponse),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  }

  async getDetail(shippingCarrierId: string): Promise<ShippingCarrierResponse> {
    const carrier =
      await this.shippingCarriersRepository.findById(shippingCarrierId);

    if (!carrier) {
      throw new NotFoundException('Shipping carrier not found');
    }

    return toShippingCarrierResponse(carrier);
  }

  async create(
    dto: CreateShippingCarrierDto,
  ): Promise<ShippingCarrierResponse> {
    const code = this.normalizeCode(dto.code);
    const existingCarrier =
      await this.shippingCarriersRepository.findByCode(code);

    if (existingCarrier) {
      throw new ConflictException('Shipping carrier code already exists');
    }

    const carrier = this.shippingCarriersRepository.create({
      code,
      name: dto.name.trim(),
      fee: dto.fee.toFixed(2),
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const savedCarrier = await this.shippingCarriersRepository.save(carrier);

    return toShippingCarrierResponse(savedCarrier);
  }

  async update(
    shippingCarrierId: string,
    dto: UpdateShippingCarrierDto,
  ): Promise<ShippingCarrierResponse> {
    const carrier =
      await this.shippingCarriersRepository.findById(shippingCarrierId);

    if (!carrier) {
      throw new NotFoundException('Shipping carrier not found');
    }

    if (dto.name !== undefined) {
      carrier.name = dto.name.trim();
    }

    if (dto.fee !== undefined) {
      carrier.fee = dto.fee.toFixed(2);
    }

    const savedCarrier = await this.shippingCarriersRepository.save(carrier);

    return toShippingCarrierResponse(savedCarrier);
  }

  async updateStatus(
    shippingCarrierId: string,
    dto: UpdateShippingCarrierStatusDto,
  ): Promise<ShippingCarrierResponse> {
    const carrier =
      await this.shippingCarriersRepository.findById(shippingCarrierId);

    if (!carrier) {
      throw new NotFoundException('Shipping carrier not found');
    }

    carrier.status = dto.status;
    const savedCarrier = await this.shippingCarriersRepository.save(carrier);

    return toShippingCarrierResponse(savedCarrier);
  }

  async delete(shippingCarrierId: string): Promise<OperationResultResponse> {
    const carrier =
      await this.shippingCarriersRepository.findById(shippingCarrierId);

    if (!carrier) {
      throw new NotFoundException('Shipping carrier not found');
    }

    try {
      await this.shippingCarriersRepository.remove(carrier);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Shipping carrier cannot be deleted because it has related records',
        );
      }

      throw error;
    }

    return new OperationResultResponse({ success: true });
  }

  private normalizeCode(code: string): string {
    return code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
