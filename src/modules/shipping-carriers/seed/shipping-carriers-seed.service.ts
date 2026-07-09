import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { ShippingCarrierServicePaymentCapabilitiesRepository } from '../repositories/shipping-carrier-service-payment-capabilities.repository';
import { ShippingCarrierServicesRepository } from '../repositories/shipping-carrier-services.repository';
import { ShippingCarriersRepository } from '../repositories/shipping-carriers.repository';

export const SHIPPING_CARRIER_SEEDS = [
  {
    code: 'aras_kargo',
    name: 'Aras Kargo',
    sortOrder: 10,
    services: [
      {
        code: 'standard_delivery',
        name: 'Standart Teslimat',
        price: '79.00',
        description: 'Standart teslimat hizmeti',
        estimatedDeliveryText: '2-3 is gunu',
        sortOrder: 10,
        paymentCapabilities: [
          {
            paymentMethod: PaymentMethodCode.CASH_ON_DELIVERY,
            fee: '25.00',
            sortOrder: 10,
          },
          {
            paymentMethod: PaymentMethodCode.CARD_ON_DELIVERY,
            fee: '35.00',
            sortOrder: 20,
          },
        ],
      },
      {
        code: 'express_delivery',
        name: 'Ekspres Teslimat',
        price: '129.00',
        description: 'Hizli teslimat hizmeti',
        estimatedDeliveryText: 'Ayni gun teslimat',
        sortOrder: 20,
        paymentCapabilities: [],
      },
    ],
  },
  {
    code: 'mng_kargo',
    name: 'MNG Kargo',
    sortOrder: 20,
    services: [
      {
        code: 'standard_delivery',
        name: 'Standart Teslimat',
        price: '69.00',
        description: 'Standart teslimat hizmeti',
        estimatedDeliveryText: '2-4 is gunu',
        sortOrder: 10,
        paymentCapabilities: [
          {
            paymentMethod: PaymentMethodCode.CASH_ON_DELIVERY,
            fee: '20.00',
            sortOrder: 10,
          },
        ],
      },
    ],
  },
  {
    code: 'yurtici_kargo',
    name: 'Yurtici Kargo',
    sortOrder: 30,
    services: [
      {
        code: 'standard_delivery',
        name: 'Standart Teslimat',
        price: '74.90',
        description: 'Standart teslimat hizmeti',
        estimatedDeliveryText: '1-3 is gunu',
        sortOrder: 10,
        paymentCapabilities: [
          {
            paymentMethod: PaymentMethodCode.CASH_ON_DELIVERY,
            fee: '18.00',
            sortOrder: 10,
          },
          {
            paymentMethod: PaymentMethodCode.CARD_ON_DELIVERY,
            fee: '29.00',
            sortOrder: 20,
          },
        ],
      },
      {
        code: 'branch_delivery',
        name: 'Magazadan Teslim',
        price: '49.90',
        description: 'Sube teslim alma secenegi',
        estimatedDeliveryText: '1-2 is gunu',
        sortOrder: 20,
        paymentCapabilities: [
          {
            paymentMethod: PaymentMethodCode.CASH_ON_DELIVERY,
            fee: '15.00',
            sortOrder: 10,
          },
        ],
      },
    ],
  },
  {
    code: 'hepsijet',
    name: 'HepsiJET',
    sortOrder: 40,
    services: [
      {
        code: 'standard_delivery',
        name: 'Standart Teslimat',
        price: '59.90',
        description: 'Standart teslimat hizmeti',
        estimatedDeliveryText: '1-2 is gunu',
        sortOrder: 10,
        paymentCapabilities: [],
      },
      {
        code: 'same_day_delivery',
        name: 'Ayni Gun Teslimat',
        price: '149.90',
        description: 'Secili bolgelerde ayni gun teslimat',
        estimatedDeliveryText: 'Bugun teslim',
        sortOrder: 20,
        paymentCapabilities: [],
      },
    ],
  },
] as const;

@Injectable()
export class ShippingCarriersSeedService implements OnModuleInit {
  private readonly logger = new Logger(ShippingCarriersSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly shippingCarriersRepository: ShippingCarriersRepository,
    private readonly shippingCarrierServicesRepository: ShippingCarrierServicesRepository,
    private readonly shippingCarrierServicePaymentCapabilitiesRepository: ShippingCarrierServicePaymentCapabilitiesRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'reference')) {
      this.logger.log('Skipping shipping carrier reference seed.');
      return;
    }

    for (const carrierSeed of SHIPPING_CARRIER_SEEDS) {
      let carrier = await this.shippingCarriersRepository.findByCode(
        carrierSeed.code,
      );

      if (!carrier) {
        carrier = await this.shippingCarriersRepository.save(
          this.shippingCarriersRepository.create({
            code: carrierSeed.code,
            name: carrierSeed.name,
            description: null,
            logoUrl: null,
            sortOrder: carrierSeed.sortOrder,
            status: RecordStatus.ACTIVE,
          }),
        );
      }

      for (const serviceSeed of carrierSeed.services) {
        let shippingCarrierService =
          await this.shippingCarrierServicesRepository.findByCarrierAndCode(
            carrier.id,
            serviceSeed.code,
          );

        if (!shippingCarrierService) {
          shippingCarrierService =
            await this.shippingCarrierServicesRepository.save(
              this.shippingCarrierServicesRepository.create({
                shippingCarrierId: carrier.id,
                code: serviceSeed.code,
                name: serviceSeed.name,
                description: serviceSeed.description,
                price: serviceSeed.price,
                currency: 'TRY',
                estimatedDeliveryText: serviceSeed.estimatedDeliveryText,
                sortOrder: serviceSeed.sortOrder,
                status: RecordStatus.ACTIVE,
              }),
            );
        }

        for (const capabilitySeed of serviceSeed.paymentCapabilities) {
          const existingPaymentCapability =
            await this.shippingCarrierServicePaymentCapabilitiesRepository.findByServiceAndPaymentMethod(
              shippingCarrierService.id,
              capabilitySeed.paymentMethod,
            );

          if (existingPaymentCapability) {
            continue;
          }

          await this.shippingCarrierServicePaymentCapabilitiesRepository.save(
            this.shippingCarrierServicePaymentCapabilitiesRepository.create({
              shippingCarrierServiceId: shippingCarrierService.id,
              paymentMethod: capabilitySeed.paymentMethod,
              fee: capabilitySeed.fee,
              currency: 'TRY',
              minOrderAmount: null,
              maxOrderAmount: null,
              sortOrder: capabilitySeed.sortOrder,
              status: RecordStatus.ACTIVE,
            }),
          );
        }
      }
    }
  }
}
