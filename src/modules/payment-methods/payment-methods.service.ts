// src/modules/payment-methods/payment-methods.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ListPaymentMethodsQueryDto } from './dto/list-payment-methods-query.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { UpdatePaymentMethodStatusDto } from './dto/update-payment-method-status.dto';
import { toPaymentMethodResponse } from './mappers/payment-methods.mapper';
import { PaymentMethodsRepository } from './repositories/payment-methods.repository';
import { PaymentMethodListResponse } from './responses/payment-method-list.response';
import { OperationResultResponse } from './responses/operation-result.response';
import { PaymentMethodResponse } from './responses/payment-method.response';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly paymentMethodsRepository: PaymentMethodsRepository,
  ) {}

  async listPublic(): Promise<
    PaymentMethodListResponse<PaymentMethodResponse>
  > {
    const paymentMethods = await this.paymentMethodsRepository.findActive();

    return new PaymentMethodListResponse({
      items: paymentMethods.map(toPaymentMethodResponse),
    });
  }

  async listAdmin(
    query: ListPaymentMethodsQueryDto,
  ): Promise<PaymentMethodListResponse<PaymentMethodResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [paymentMethods, totalItems] =
      await this.paymentMethodsRepository.listAdmin(query);

    return new PaymentMethodListResponse({
      items: paymentMethods.map(toPaymentMethodResponse),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  }

  async getDetail(paymentMethodId: string): Promise<PaymentMethodResponse> {
    const paymentMethod =
      await this.paymentMethodsRepository.findById(paymentMethodId);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return toPaymentMethodResponse(paymentMethod);
  }

  async create(dto: CreatePaymentMethodDto): Promise<PaymentMethodResponse> {
    const code = this.normalizeCode(dto.code);
    const existingPaymentMethod =
      await this.paymentMethodsRepository.findByCode(code);

    if (existingPaymentMethod) {
      throw new ConflictException('Payment method code already exists');
    }

    const paymentMethod = this.paymentMethodsRepository.create({
      code,
      name: dto.name.trim(),
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    const savedPaymentMethod =
      await this.paymentMethodsRepository.save(paymentMethod);

    return toPaymentMethodResponse(savedPaymentMethod);
  }

  async update(
    paymentMethodId: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponse> {
    const paymentMethod =
      await this.paymentMethodsRepository.findById(paymentMethodId);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (dto.name !== undefined) {
      paymentMethod.name = dto.name.trim();
    }

    const savedPaymentMethod =
      await this.paymentMethodsRepository.save(paymentMethod);

    return toPaymentMethodResponse(savedPaymentMethod);
  }

  async updateStatus(
    paymentMethodId: string,
    dto: UpdatePaymentMethodStatusDto,
  ): Promise<PaymentMethodResponse> {
    const paymentMethod =
      await this.paymentMethodsRepository.findById(paymentMethodId);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    paymentMethod.status = dto.status;
    const savedPaymentMethod =
      await this.paymentMethodsRepository.save(paymentMethod);

    return toPaymentMethodResponse(savedPaymentMethod);
  }

  async delete(paymentMethodId: string): Promise<OperationResultResponse> {
    const paymentMethod =
      await this.paymentMethodsRepository.findById(paymentMethodId);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    try {
      await this.paymentMethodsRepository.remove(paymentMethod);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Payment method cannot be deleted because it has related records',
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
