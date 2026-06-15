// src/modules/payment-methods/payment-methods.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PaymentMethodCode } from '../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { ListPublicPaymentMethodsQueryDto } from './dto/list-public-payment-methods-query.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreatePaymentProviderDto } from './dto/create-payment-provider.dto';
import { ListPaymentMethodsQueryDto } from './dto/list-payment-methods-query.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { UpdatePaymentMethodStatusDto } from './dto/update-payment-method-status.dto';
import { UpdatePaymentProviderDto } from './dto/update-payment-provider.dto';
import { UpdatePaymentProviderStatusDto } from './dto/update-payment-provider-status.dto';
import { toPaymentMethodResponse } from './mappers/payment-methods.mapper';
import { ShippingCarrierServicesRepository } from '../shipping-carriers/repositories/shipping-carrier-services.repository';
import { PaymentMethodsRepository } from './repositories/payment-methods.repository';
import { PaymentProvidersRepository } from './repositories/payment-providers.repository';
import { PaymentMethodListResponse } from './responses/payment-method-list.response';
import { OperationResultResponse } from './responses/operation-result.response';
import { PaymentMethodResponse } from './responses/payment-method.response';
import { PaymentMethod } from './entities/payment-method.entity';
import { ShippingCarrierService } from '../shipping-carriers/entities/shipping-carrier-service.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly paymentMethodsRepository: PaymentMethodsRepository,
    private readonly shippingCarrierServicesRepository: ShippingCarrierServicesRepository,
    private readonly paymentProvidersRepository: PaymentProvidersRepository,
  ) {}

  async listPublic(
    query: ListPublicPaymentMethodsQueryDto,
  ): Promise<
    PaymentMethodListResponse<PaymentMethodResponse>
  > {
    const paymentMethods = await this.paymentMethodsRepository.findActivePublic();
    const shippingCarrierService = query.shippingServiceId
      ? await this.shippingCarrierServicesRepository.findActivePublicById(
          query.shippingServiceId,
        )
      : null;

    return new PaymentMethodListResponse({
      items: paymentMethods.map((paymentMethod) =>
        this.toPublicPaymentMethodResponse(paymentMethod, shippingCarrierService),
      ),
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

  async createProvider(
    paymentMethodId: string,
    dto: CreatePaymentProviderDto,
  ): Promise<PaymentMethodResponse> {
    const paymentMethod =
      await this.paymentMethodsRepository.findById(paymentMethodId);

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    const code = this.normalizeCode(dto.code);
    const existingPaymentProvider =
      await this.paymentProvidersRepository.findByPaymentMethodAndCode(
        paymentMethodId,
        code,
      );

    if (existingPaymentProvider) {
      throw new ConflictException(
        'Payment provider code already exists for this payment method',
      );
    }

    const paymentProvider = this.paymentProvidersRepository.create({
      paymentMethodId,
      code,
      name: dto.name.trim(),
      providerType: dto.providerType,
      description: dto.description?.trim() || null,
      logoUrl: dto.logoUrl?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? RecordStatus.ACTIVE,
    });

    await this.paymentProvidersRepository.save(paymentProvider);

    return this.getDetail(paymentMethodId);
  }

  async updateProvider(
    paymentMethodId: string,
    paymentProviderId: string,
    dto: UpdatePaymentProviderDto,
  ): Promise<PaymentMethodResponse> {
    const paymentProvider =
      await this.paymentProvidersRepository.findById(paymentProviderId);

    if (!paymentProvider || paymentProvider.paymentMethodId !== paymentMethodId) {
      throw new NotFoundException('Payment provider not found');
    }

    if (dto.name !== undefined) {
      paymentProvider.name = dto.name.trim();
    }

    if (dto.providerType !== undefined) {
      paymentProvider.providerType = dto.providerType;
    }

    if (dto.description !== undefined) {
      paymentProvider.description = dto.description?.trim() || null;
    }

    if (dto.logoUrl !== undefined) {
      paymentProvider.logoUrl = dto.logoUrl?.trim() || null;
    }

    if (dto.sortOrder !== undefined) {
      paymentProvider.sortOrder = dto.sortOrder;
    }

    await this.paymentProvidersRepository.save(paymentProvider);

    return this.getDetail(paymentMethodId);
  }

  async updateProviderStatus(
    paymentMethodId: string,
    paymentProviderId: string,
    dto: UpdatePaymentProviderStatusDto,
  ): Promise<PaymentMethodResponse> {
    const paymentProvider =
      await this.paymentProvidersRepository.findById(paymentProviderId);

    if (!paymentProvider || paymentProvider.paymentMethodId !== paymentMethodId) {
      throw new NotFoundException('Payment provider not found');
    }

    paymentProvider.status = dto.status;
    await this.paymentProvidersRepository.save(paymentProvider);

    return this.getDetail(paymentMethodId);
  }

  async deleteProvider(
    paymentMethodId: string,
    paymentProviderId: string,
  ): Promise<OperationResultResponse> {
    const paymentProvider =
      await this.paymentProvidersRepository.findById(paymentProviderId);

    if (!paymentProvider || paymentProvider.paymentMethodId !== paymentMethodId) {
      throw new NotFoundException('Payment provider not found');
    }

    try {
      await this.paymentProvidersRepository.remove(paymentProvider);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Payment provider cannot be deleted because it has related records',
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

  private toPublicPaymentMethodResponse(
    paymentMethod: PaymentMethod,
    shippingCarrierService: ShippingCarrierService | null,
  ): PaymentMethodResponse {
    const baseResponse = toPaymentMethodResponse(paymentMethod);
    const isConditionalMethod = this.isConditionalPaymentMethod(paymentMethod.code);
    const isBaseMethod = this.isBasePaymentMethod(paymentMethod.code);

    if (!isConditionalMethod) {
      return {
        ...baseResponse,
        providers: baseResponse.providers,
        isBaseMethod,
        isConditionalMethod: false,
        isSelectable: true,
        availabilityReason: 'available',
      };
    }

    if (!shippingCarrierService) {
      return {
        ...baseResponse,
        providers: baseResponse.providers,
        isBaseMethod: false,
        isConditionalMethod: true,
        isSelectable: false,
        availabilityReason: 'shipping_service_required',
      };
    }

    const paymentCapability = shippingCarrierService.paymentCapabilities.find(
      (item) => item.paymentMethod === paymentMethod.code,
    );

    if (!paymentCapability) {
      return {
        ...baseResponse,
        providers: baseResponse.providers,
        isBaseMethod: false,
        isConditionalMethod: true,
        isSelectable: false,
        availabilityReason: 'not_supported_by_shipping_service',
      };
    }

    return {
      ...baseResponse,
      providers: baseResponse.providers,
      isBaseMethod: false,
      isConditionalMethod: true,
      isSelectable: true,
      availabilityReason: 'available',
      extraFee: this.toNumber(paymentCapability.fee),
      currency: paymentCapability.currency,
      minOrderAmount: paymentCapability.minOrderAmount
        ? this.toNumber(paymentCapability.minOrderAmount)
        : null,
      maxOrderAmount: paymentCapability.maxOrderAmount
        ? this.toNumber(paymentCapability.maxOrderAmount)
        : null,
    };
  }

  private isBasePaymentMethod(code: string): boolean {
    return (
      code === PaymentMethodCode.CREDIT_CARD ||
      code === PaymentMethodCode.BANK_TRANSFER
    );
  }

  private isConditionalPaymentMethod(code: string): boolean {
    return (
      code === PaymentMethodCode.CASH_ON_DELIVERY ||
      code === PaymentMethodCode.CARD_ON_DELIVERY
    );
  }

  private toNumber(value: string | number | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }

    return Number(value);
  }
}
