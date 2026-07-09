import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { PaymentMethodCode } from '../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../common/enums/record-status.enum';
import { SYSTEM_SETTING_KEYS } from '../system-settings/constants/system-setting-keys';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { CreateShippingCarrierDto } from './dto/create-shipping-carrier.dto';
import { CreateShippingCarrierServicePaymentCapabilityDto } from './dto/create-shipping-carrier-service-payment-capability.dto';
import { CreateShippingCarrierServiceDto } from './dto/create-shipping-carrier-service.dto';
import { ListShippingCarriersQueryDto } from './dto/list-shipping-carriers-query.dto';
import { UpdateShippingCarrierServicePaymentCapabilityDto } from './dto/update-shipping-carrier-service-payment-capability.dto';
import { UpdateShippingCarrierServicePaymentCapabilityStatusDto } from './dto/update-shipping-carrier-service-payment-capability-status.dto';
import { UpdateShippingCarrierServiceDto } from './dto/update-shipping-carrier-service.dto';
import { UpdateShippingCarrierServiceStatusDto } from './dto/update-shipping-carrier-service-status.dto';
import { UpdateShippingCarrierDto } from './dto/update-shipping-carrier.dto';
import { UpdateShippingCarrierStatusDto } from './dto/update-shipping-carrier-status.dto';
import {
  toShippingCarrierPublicResponse,
  toShippingCarrierResponse,
} from './mappers/shipping-carriers.mapper';
import { ShippingCarrierServicePaymentCapabilitiesRepository } from './repositories/shipping-carrier-service-payment-capabilities.repository';
import { ShippingCarrierServicesRepository } from './repositories/shipping-carrier-services.repository';
import { ShippingCarriersRepository } from './repositories/shipping-carriers.repository';
import { ShippingCarrierListResponse } from './responses/shipping-carrier-list.response';
import { ShippingCarrierPublicResponse } from './responses/shipping-carrier-public.response';
import { OperationResultResponse } from './responses/operation-result.response';
import { ShippingCarrierResponse } from './responses/shipping-carrier.response';

@Injectable()
export class ShippingCarriersService {
  constructor(
    private readonly shippingCarriersRepository: ShippingCarriersRepository,
    private readonly shippingCarrierServicesRepository: ShippingCarrierServicesRepository,
    private readonly shippingCarrierServicePaymentCapabilitiesRepository: ShippingCarrierServicePaymentCapabilitiesRepository,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async listPublic(): Promise<ShippingCarrierListResponse<ShippingCarrierPublicResponse>> {
    const shippingCarrierServices =
      await this.shippingCarrierServicesRepository.findActivePublic();
    const freeShippingThreshold = this.systemSettingsService.getNumber(
      SYSTEM_SETTING_KEYS.ORDER_FREE_SHIPPING_THRESHOLD,
      1000,
    );

    return new ShippingCarrierListResponse({
      items: shippingCarrierServices.map(toShippingCarrierPublicResponse),
      freeShippingThreshold,
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
      await this.shippingCarriersRepository.findByIdWithRelations(
        shippingCarrierId,
      );

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
      description: dto.description?.trim() || null,
      logoUrl: dto.logoUrl?.trim() || null,
      sortOrder: dto.sortOrder ?? 0,
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

    if (dto.description !== undefined) {
      carrier.description = dto.description?.trim() || null;
    }

    if (dto.logoUrl !== undefined) {
      carrier.logoUrl = dto.logoUrl?.trim() || null;
    }

    if (dto.sortOrder !== undefined) {
      carrier.sortOrder = dto.sortOrder;
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

  async createService(
    shippingCarrierId: string,
    dto: CreateShippingCarrierServiceDto,
  ): Promise<ShippingCarrierResponse> {
    const carrier =
      await this.shippingCarriersRepository.findById(shippingCarrierId);

    if (!carrier) {
      throw new NotFoundException('Shipping carrier not found');
    }

    const code = this.normalizeCode(dto.code);
    const existingService =
      await this.shippingCarrierServicesRepository.findByCarrierAndCode(
        shippingCarrierId,
        code,
      );

    if (existingService) {
      throw new ConflictException(
        'Shipping carrier service code already exists for this carrier',
      );
    }

    const shippingCarrierService =
      this.shippingCarrierServicesRepository.create({
        shippingCarrierId,
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        price: dto.price.toFixed(2),
        currency: this.normalizeCurrency(dto.currency),
        estimatedDeliveryText: dto.estimatedDeliveryText?.trim() || null,
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status ?? RecordStatus.ACTIVE,
      });

    await this.shippingCarrierServicesRepository.save(shippingCarrierService);

    return this.getDetail(shippingCarrierId);
  }

  async updateService(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    dto: UpdateShippingCarrierServiceDto,
  ): Promise<ShippingCarrierResponse> {
    const shippingCarrierService =
      await this.shippingCarrierServicesRepository.findByCarrierAndId(
        shippingCarrierId,
        shippingCarrierServiceId,
      );

    if (!shippingCarrierService) {
      throw new NotFoundException('Shipping carrier service not found');
    }

    if (dto.name !== undefined) {
      shippingCarrierService.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      shippingCarrierService.description = dto.description?.trim() || null;
    }

    if (dto.price !== undefined) {
      shippingCarrierService.price = dto.price.toFixed(2);
    }

    if (dto.currency !== undefined) {
      shippingCarrierService.currency = this.normalizeCurrency(dto.currency);
    }

    if (dto.estimatedDeliveryText !== undefined) {
      shippingCarrierService.estimatedDeliveryText =
        dto.estimatedDeliveryText?.trim() || null;
    }

    if (dto.sortOrder !== undefined) {
      shippingCarrierService.sortOrder = dto.sortOrder;
    }

    await this.shippingCarrierServicesRepository.save(shippingCarrierService);

    return this.getDetail(shippingCarrierId);
  }

  async updateServiceStatus(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    dto: UpdateShippingCarrierServiceStatusDto,
  ): Promise<ShippingCarrierResponse> {
    const shippingCarrierService =
      await this.shippingCarrierServicesRepository.findByCarrierAndId(
        shippingCarrierId,
        shippingCarrierServiceId,
      );

    if (!shippingCarrierService) {
      throw new NotFoundException('Shipping carrier service not found');
    }

    shippingCarrierService.status = dto.status;
    await this.shippingCarrierServicesRepository.save(shippingCarrierService);

    return this.getDetail(shippingCarrierId);
  }

  async deleteService(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
  ): Promise<OperationResultResponse> {
    const shippingCarrierService =
      await this.shippingCarrierServicesRepository.findByCarrierAndId(
        shippingCarrierId,
        shippingCarrierServiceId,
      );

    if (!shippingCarrierService) {
      throw new NotFoundException('Shipping carrier service not found');
    }

    await this.shippingCarrierServicesRepository.remove(shippingCarrierService);

    return new OperationResultResponse({ success: true });
  }

  async createPaymentCapability(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    dto: CreateShippingCarrierServicePaymentCapabilityDto,
  ): Promise<ShippingCarrierResponse> {
    this.ensureShippingServicePaymentMethod(dto.paymentMethod);
    this.validateAmountRange(dto.minOrderAmount, dto.maxOrderAmount);

    const shippingCarrierService =
      await this.shippingCarrierServicesRepository.findByCarrierAndId(
        shippingCarrierId,
        shippingCarrierServiceId,
      );

    if (!shippingCarrierService) {
      throw new NotFoundException('Shipping carrier service not found');
    }

    const existingPaymentCapability =
      await this.shippingCarrierServicePaymentCapabilitiesRepository.findByServiceAndPaymentMethod(
        shippingCarrierServiceId,
        dto.paymentMethod,
      );

    if (existingPaymentCapability) {
      throw new ConflictException(
        'Shipping carrier service payment capability already exists',
      );
    }

    const shippingCarrierServicePaymentCapability =
      this.shippingCarrierServicePaymentCapabilitiesRepository.create({
        shippingCarrierServiceId,
        paymentMethod: dto.paymentMethod,
        fee: (dto.fee ?? 0).toFixed(2),
        currency: this.normalizeCurrency(dto.currency),
        minOrderAmount:
          dto.minOrderAmount === undefined || dto.minOrderAmount === null
            ? null
            : dto.minOrderAmount.toFixed(2),
        maxOrderAmount:
          dto.maxOrderAmount === undefined || dto.maxOrderAmount === null
            ? null
            : dto.maxOrderAmount.toFixed(2),
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status ?? RecordStatus.ACTIVE,
      });

    await this.shippingCarrierServicePaymentCapabilitiesRepository.save(
      shippingCarrierServicePaymentCapability,
    );

    return this.getDetail(shippingCarrierId);
  }

  async updatePaymentCapability(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    shippingCarrierServicePaymentCapabilityId: string,
    dto: UpdateShippingCarrierServicePaymentCapabilityDto,
  ): Promise<ShippingCarrierResponse> {
    const shippingCarrierServicePaymentCapability =
      await this.shippingCarrierServicePaymentCapabilitiesRepository.findById(
        shippingCarrierServicePaymentCapabilityId,
      );

    if (
      !shippingCarrierServicePaymentCapability ||
      shippingCarrierServicePaymentCapability.shippingCarrierServiceId !==
        shippingCarrierServiceId ||
      shippingCarrierServicePaymentCapability.shippingCarrierService
        .shippingCarrierId !== shippingCarrierId
    ) {
      throw new NotFoundException(
        'Shipping carrier service payment capability not found',
      );
    }

    const minOrderAmount =
      dto.minOrderAmount !== undefined
        ? dto.minOrderAmount
        : shippingCarrierServicePaymentCapability.minOrderAmount
          ? Number(shippingCarrierServicePaymentCapability.minOrderAmount)
          : null;
    const maxOrderAmount =
      dto.maxOrderAmount !== undefined
        ? dto.maxOrderAmount
        : shippingCarrierServicePaymentCapability.maxOrderAmount
          ? Number(shippingCarrierServicePaymentCapability.maxOrderAmount)
          : null;

    this.validateAmountRange(minOrderAmount, maxOrderAmount);

    if (dto.paymentMethod !== undefined) {
      this.ensureShippingServicePaymentMethod(dto.paymentMethod);

      const existingPaymentCapability =
        await this.shippingCarrierServicePaymentCapabilitiesRepository.findAnotherByServiceAndPaymentMethod(
          shippingCarrierServiceId,
          shippingCarrierServicePaymentCapabilityId,
          dto.paymentMethod,
        );

      if (existingPaymentCapability) {
        throw new ConflictException(
          'Shipping carrier service payment capability already exists',
        );
      }

      shippingCarrierServicePaymentCapability.paymentMethod = dto.paymentMethod;
    }

    if (dto.fee !== undefined) {
      shippingCarrierServicePaymentCapability.fee = dto.fee.toFixed(2);
    }

    if (dto.currency !== undefined) {
      shippingCarrierServicePaymentCapability.currency = this.normalizeCurrency(
        dto.currency,
      );
    }

    if (dto.minOrderAmount !== undefined) {
      shippingCarrierServicePaymentCapability.minOrderAmount =
        dto.minOrderAmount === null ? null : dto.minOrderAmount.toFixed(2);
    }

    if (dto.maxOrderAmount !== undefined) {
      shippingCarrierServicePaymentCapability.maxOrderAmount =
        dto.maxOrderAmount === null ? null : dto.maxOrderAmount.toFixed(2);
    }

    if (dto.sortOrder !== undefined) {
      shippingCarrierServicePaymentCapability.sortOrder = dto.sortOrder;
    }

    await this.shippingCarrierServicePaymentCapabilitiesRepository.save(
      shippingCarrierServicePaymentCapability,
    );

    return this.getDetail(shippingCarrierId);
  }

  async updatePaymentCapabilityStatus(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    shippingCarrierServicePaymentCapabilityId: string,
    dto: UpdateShippingCarrierServicePaymentCapabilityStatusDto,
  ): Promise<ShippingCarrierResponse> {
    const shippingCarrierServicePaymentCapability =
      await this.shippingCarrierServicePaymentCapabilitiesRepository.findById(
        shippingCarrierServicePaymentCapabilityId,
      );

    if (
      !shippingCarrierServicePaymentCapability ||
      shippingCarrierServicePaymentCapability.shippingCarrierServiceId !==
        shippingCarrierServiceId ||
      shippingCarrierServicePaymentCapability.shippingCarrierService
        .shippingCarrierId !== shippingCarrierId
    ) {
      throw new NotFoundException(
        'Shipping carrier service payment capability not found',
      );
    }

    shippingCarrierServicePaymentCapability.status = dto.status;
    await this.shippingCarrierServicePaymentCapabilitiesRepository.save(
      shippingCarrierServicePaymentCapability,
    );

    return this.getDetail(shippingCarrierId);
  }

  async deletePaymentCapability(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    shippingCarrierServicePaymentCapabilityId: string,
  ): Promise<OperationResultResponse> {
    const shippingCarrierServicePaymentCapability =
      await this.shippingCarrierServicePaymentCapabilitiesRepository.findById(
        shippingCarrierServicePaymentCapabilityId,
      );

    if (
      !shippingCarrierServicePaymentCapability ||
      shippingCarrierServicePaymentCapability.shippingCarrierServiceId !==
        shippingCarrierServiceId ||
      shippingCarrierServicePaymentCapability.shippingCarrierService
        .shippingCarrierId !== shippingCarrierId
    ) {
      throw new NotFoundException(
        'Shipping carrier service payment capability not found',
      );
    }

    await this.shippingCarrierServicePaymentCapabilitiesRepository.remove(
      shippingCarrierServicePaymentCapability,
    );

    return new OperationResultResponse({ success: true });
  }

  private normalizeCode(code: string): string {
    return code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private normalizeCurrency(currency?: string): string {
    return currency?.trim().toUpperCase() || 'TRY';
  }

  private ensureShippingServicePaymentMethod(
    paymentMethod: PaymentMethodCode,
  ): void {
    if (
      paymentMethod !== PaymentMethodCode.CASH_ON_DELIVERY &&
      paymentMethod !== PaymentMethodCode.CARD_ON_DELIVERY
    ) {
      throw new ConflictException(
        'Shipping service payment capability only supports kapida payment methods',
      );
    }
  }

  private validateAmountRange(
    minOrderAmount?: number | null,
    maxOrderAmount?: number | null,
  ): void {
    if (
      minOrderAmount !== undefined &&
      minOrderAmount !== null &&
      maxOrderAmount !== undefined &&
      maxOrderAmount !== null &&
      minOrderAmount > maxOrderAmount
    ) {
      throw new ConflictException(
        'Minimum order amount cannot be greater than maximum order amount',
      );
    }
  }
}
