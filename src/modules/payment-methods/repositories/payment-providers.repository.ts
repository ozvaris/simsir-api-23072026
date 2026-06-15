import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { PaymentProvider } from '../entities/payment-provider.entity';

@Injectable()
export class PaymentProvidersRepository {
  constructor(
    @InjectRepository(PaymentProvider)
    private readonly paymentProviderRepository: Repository<PaymentProvider>,
  ) {}

  findById(paymentProviderId: string): Promise<PaymentProvider | null> {
    return this.paymentProviderRepository.findOne({
      where: { id: paymentProviderId },
      relations: {
        paymentMethod: true,
      },
    });
  }

  findByPaymentMethodAndCode(
    paymentMethodId: string,
    code: string,
  ): Promise<PaymentProvider | null> {
    return this.paymentProviderRepository.findOne({
      where: {
        paymentMethodId,
        code,
      },
    });
  }

  findAnotherByPaymentMethodAndCode(
    paymentMethodId: string,
    paymentProviderId: string,
    code: string,
  ): Promise<PaymentProvider | null> {
    return this.paymentProviderRepository.findOne({
      where: {
        id: Not(paymentProviderId),
        paymentMethodId,
        code,
      },
    });
  }

  findActiveByPaymentMethodId(
    paymentMethodId: string,
  ): Promise<PaymentProvider[]> {
    return this.paymentProviderRepository.find({
      where: {
        paymentMethodId,
        status: RecordStatus.ACTIVE,
      },
      order: {
        sortOrder: 'ASC',
        code: 'ASC',
      },
    });
  }

  create(data: Partial<PaymentProvider>): PaymentProvider {
    return this.paymentProviderRepository.create(data);
  }

  save(paymentProvider: PaymentProvider): Promise<PaymentProvider> {
    return this.paymentProviderRepository.save(paymentProvider);
  }

  async remove(paymentProvider: PaymentProvider): Promise<void> {
    await this.paymentProviderRepository.remove(paymentProvider);
  }
}
