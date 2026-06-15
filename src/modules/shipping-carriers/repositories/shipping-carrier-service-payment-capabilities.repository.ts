import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { ShippingCarrierServicePaymentCapability } from '../entities/shipping-carrier-service-payment-capability.entity';

@Injectable()
export class ShippingCarrierServicePaymentCapabilitiesRepository {
  constructor(
    @InjectRepository(ShippingCarrierServicePaymentCapability)
    private readonly shippingCarrierServicePaymentCapabilityRepository: Repository<ShippingCarrierServicePaymentCapability>,
  ) {}

  findById(
    shippingCarrierServicePaymentCapabilityId: string,
  ): Promise<ShippingCarrierServicePaymentCapability | null> {
    return this.shippingCarrierServicePaymentCapabilityRepository.findOne({
      where: { id: shippingCarrierServicePaymentCapabilityId },
      relations: {
        shippingCarrierService: {
          shippingCarrier: true,
        },
      },
    });
  }

  findByServiceAndPaymentMethod(
    shippingCarrierServiceId: string,
    paymentMethod: PaymentMethodCode,
  ): Promise<ShippingCarrierServicePaymentCapability | null> {
    return this.shippingCarrierServicePaymentCapabilityRepository.findOne({
      where: {
        shippingCarrierServiceId,
        paymentMethod,
      },
    });
  }

  findAnotherByServiceAndPaymentMethod(
    shippingCarrierServiceId: string,
    shippingCarrierServicePaymentCapabilityId: string,
    paymentMethod: PaymentMethodCode,
  ): Promise<ShippingCarrierServicePaymentCapability | null> {
    return this.shippingCarrierServicePaymentCapabilityRepository.findOne({
      where: {
        id: Not(shippingCarrierServicePaymentCapabilityId),
        shippingCarrierServiceId,
        paymentMethod,
      },
    });
  }

  create(
    data: Partial<ShippingCarrierServicePaymentCapability>,
  ): ShippingCarrierServicePaymentCapability {
    return this.shippingCarrierServicePaymentCapabilityRepository.create(data);
  }

  save(
    shippingCarrierServicePaymentCapability: ShippingCarrierServicePaymentCapability,
  ): Promise<ShippingCarrierServicePaymentCapability> {
    return this.shippingCarrierServicePaymentCapabilityRepository.save(
      shippingCarrierServicePaymentCapability,
    );
  }

  async remove(
    shippingCarrierServicePaymentCapability: ShippingCarrierServicePaymentCapability,
  ): Promise<void> {
    await this.shippingCarrierServicePaymentCapabilityRepository.remove(
      shippingCarrierServicePaymentCapability,
    );
  }
}
