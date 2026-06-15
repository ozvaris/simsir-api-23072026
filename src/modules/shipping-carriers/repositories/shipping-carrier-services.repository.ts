import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ShippingCarrierService } from '../entities/shipping-carrier-service.entity';

@Injectable()
export class ShippingCarrierServicesRepository {
  constructor(
    @InjectRepository(ShippingCarrierService)
    private readonly shippingCarrierServiceRepository: Repository<ShippingCarrierService>,
  ) {}

  findActivePublic(): Promise<ShippingCarrierService[]> {
    return this.shippingCarrierServiceRepository
      .createQueryBuilder('shippingCarrierService')
      .innerJoinAndSelect(
        'shippingCarrierService.shippingCarrier',
        'shippingCarrier',
        'shippingCarrier.status = :carrierStatus',
        { carrierStatus: RecordStatus.ACTIVE },
      )
      .leftJoinAndSelect(
        'shippingCarrierService.paymentCapabilities',
        'paymentCapability',
        'paymentCapability.status = :paymentCapabilityStatus',
        { paymentCapabilityStatus: RecordStatus.ACTIVE },
      )
      .where('shippingCarrierService.status = :serviceStatus', {
        serviceStatus: RecordStatus.ACTIVE,
      })
      .orderBy('shippingCarrier.sortOrder', 'ASC')
      .addOrderBy('shippingCarrier.code', 'ASC')
      .addOrderBy('shippingCarrierService.sortOrder', 'ASC')
      .addOrderBy('shippingCarrierService.code', 'ASC')
      .addOrderBy('paymentCapability.sortOrder', 'ASC')
      .addOrderBy('paymentCapability.paymentMethod', 'ASC')
      .getMany();
  }

  findActivePublicById(
    shippingCarrierServiceId: string,
  ): Promise<ShippingCarrierService | null> {
    return this.shippingCarrierServiceRepository
      .createQueryBuilder('shippingCarrierService')
      .innerJoinAndSelect(
        'shippingCarrierService.shippingCarrier',
        'shippingCarrier',
        'shippingCarrier.status = :carrierStatus',
        { carrierStatus: RecordStatus.ACTIVE },
      )
      .leftJoinAndSelect(
        'shippingCarrierService.paymentCapabilities',
        'paymentCapability',
        'paymentCapability.status = :paymentCapabilityStatus',
        { paymentCapabilityStatus: RecordStatus.ACTIVE },
      )
      .where('shippingCarrierService.id = :shippingCarrierServiceId', {
        shippingCarrierServiceId,
      })
      .andWhere('shippingCarrierService.status = :serviceStatus', {
        serviceStatus: RecordStatus.ACTIVE,
      })
      .getOne();
  }

  findByCarrierAndId(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
  ): Promise<ShippingCarrierService | null> {
    return this.shippingCarrierServiceRepository.findOne({
      where: {
        id: shippingCarrierServiceId,
        shippingCarrierId,
      },
      relations: {
        shippingCarrier: true,
        paymentCapabilities: true,
      },
    });
  }

  findByCarrierAndCode(
    shippingCarrierId: string,
    code: string,
  ): Promise<ShippingCarrierService | null> {
    return this.shippingCarrierServiceRepository.findOne({
      where: {
        shippingCarrierId,
        code,
      },
    });
  }

  findAnotherByCarrierAndCode(
    shippingCarrierId: string,
    shippingCarrierServiceId: string,
    code: string,
  ): Promise<ShippingCarrierService | null> {
    return this.shippingCarrierServiceRepository.findOne({
      where: {
        id: Not(shippingCarrierServiceId),
        shippingCarrierId,
        code,
      },
    });
  }

  create(data: Partial<ShippingCarrierService>): ShippingCarrierService {
    return this.shippingCarrierServiceRepository.create(data);
  }

  save(
    shippingCarrierService: ShippingCarrierService,
  ): Promise<ShippingCarrierService> {
    return this.shippingCarrierServiceRepository.save(shippingCarrierService);
  }

  async remove(shippingCarrierService: ShippingCarrierService): Promise<void> {
    await this.shippingCarrierServiceRepository.remove(shippingCarrierService);
  }
}
