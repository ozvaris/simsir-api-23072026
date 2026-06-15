// src/modules/payment-methods/seed/payment-methods-seed.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderType } from '../../../common/enums/payment-provider-type.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { PaymentMethodsRepository } from '../repositories/payment-methods.repository';
import { PaymentProvidersRepository } from '../repositories/payment-providers.repository';

export const PAYMENT_METHOD_SEEDS = [
  {
    code: 'credit_card',
    name: 'Kredi / Banka Karti',
    providers: [
      {
        code: 'paytr',
        name: 'PayTR',
        providerType: PaymentProviderType.PSP,
        sortOrder: 10,
      },
      {
        code: 'iyzico',
        name: 'iyzico',
        providerType: PaymentProviderType.PSP,
        sortOrder: 20,
      },
      {
        code: 'payu',
        name: 'PayU',
        providerType: PaymentProviderType.PSP,
        sortOrder: 30,
      },
      {
        code: 'garanti_bbva',
        name: 'Garanti BBVA',
        providerType: PaymentProviderType.BANK_POS,
        sortOrder: 40,
      },
      {
        code: 'kuveyt_turk',
        name: 'Kuveyt Turk',
        providerType: PaymentProviderType.BANK_POS,
        sortOrder: 50,
      },
      {
        code: 'asseco_virtual_pos',
        name: 'Asseco Sanal POS',
        providerType: PaymentProviderType.AGGREGATOR,
        sortOrder: 60,
      },
    ],
  },
  {
    code: 'bank_transfer',
    name: 'Havale & EFT',
    providers: [
      {
        code: 'garanti_iban',
        name: 'Garanti BBVA Kurumsal IBAN',
        providerType: PaymentProviderType.BANK_POS,
        sortOrder: 10,
      },
      {
        code: 'ziraat_iban',
        name: 'Ziraat Bankasi Kurumsal IBAN',
        providerType: PaymentProviderType.BANK_POS,
        sortOrder: 20,
      },
    ],
  },
  {
    code: 'cash_on_delivery',
    name: 'Kapida Nakit',
    providers: [],
  },
  {
    code: 'card_on_delivery',
    name: 'Kapida Kredi Karti',
    providers: [],
  },
] as const;

@Injectable()
export class PaymentMethodsSeedService implements OnModuleInit {
  private readonly logger = new Logger(PaymentMethodsSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentMethodsRepository: PaymentMethodsRepository,
    private readonly paymentProvidersRepository: PaymentProvidersRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'reference')) {
      this.logger.log('Skipping payment method reference seed.');
      return;
    }

    for (const seed of PAYMENT_METHOD_SEEDS) {
      const existingPaymentMethod =
        await this.paymentMethodsRepository.findByCode(seed.code);

      const paymentMethod =
        existingPaymentMethod ??
        (await this.paymentMethodsRepository.save(
          this.paymentMethodsRepository.create({
            code: seed.code,
            name: seed.name,
            status: RecordStatus.ACTIVE,
          }),
        ));

      for (const providerSeed of seed.providers) {
        const existingPaymentProvider =
          await this.paymentProvidersRepository.findByPaymentMethodAndCode(
            paymentMethod.id,
            providerSeed.code,
          );

        if (existingPaymentProvider) {
          continue;
        }

        await this.paymentProvidersRepository.save(
          this.paymentProvidersRepository.create({
            paymentMethodId: paymentMethod.id,
            code: providerSeed.code,
            name: providerSeed.name,
            providerType: providerSeed.providerType,
            description: null,
            logoUrl: null,
            sortOrder: providerSeed.sortOrder,
            status: RecordStatus.ACTIVE,
          }),
        );
      }
    }
  }
}
