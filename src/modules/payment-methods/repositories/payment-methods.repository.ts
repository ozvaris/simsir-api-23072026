// src/modules/payment-methods/repositories/payment-methods.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ListPaymentMethodsQueryDto } from '../dto/list-payment-methods-query.dto';
import { PaymentMethod } from '../entities/payment-method.entity';
import { RecordStatus } from '../../../common/enums/record-status.enum';

@Injectable()
export class PaymentMethodsRepository {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  findActive(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { status: RecordStatus.ACTIVE },
      order: { code: 'ASC' },
    });
  }

  findActivePublic(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository
      .createQueryBuilder('paymentMethod')
      .leftJoinAndSelect(
        'paymentMethod.providers',
        'paymentProvider',
        'paymentProvider.status = :providerStatus',
        { providerStatus: RecordStatus.ACTIVE },
      )
      .where('paymentMethod.status = :paymentMethodStatus', {
        paymentMethodStatus: RecordStatus.ACTIVE,
      })
      .orderBy('paymentMethod.code', 'ASC')
      .addOrderBy('paymentProvider.sortOrder', 'ASC')
      .addOrderBy('paymentProvider.code', 'ASC')
      .getMany();
  }

  findById(paymentMethodId: string): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId },
      relations: {
        providers: true,
      },
    });
  }

  findByIdWithActiveProviders(
    paymentMethodId: string,
  ): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository
      .createQueryBuilder('paymentMethod')
      .leftJoinAndSelect(
        'paymentMethod.providers',
        'paymentProvider',
        'paymentProvider.status = :status',
        { status: RecordStatus.ACTIVE },
      )
      .where('paymentMethod.id = :paymentMethodId', { paymentMethodId })
      .getOne();
  }

  findByCode(code: string): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findOne({
      where: { code },
    });
  }

  findAnotherByCode(
    paymentMethodId: string,
    code: string,
  ): Promise<PaymentMethod | null> {
    return this.paymentMethodRepository.findOne({
      where: {
        id: Not(paymentMethodId),
        code,
      },
    });
  }

  async listAdmin(
    query: ListPaymentMethodsQueryDto,
  ): Promise<[PaymentMethod[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.paymentMethodRepository
      .createQueryBuilder('paymentMethod')
      .orderBy('paymentMethod.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      builder.andWhere('paymentMethod.status = :status', {
        status: query.status,
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(paymentMethod.code ILIKE :search OR paymentMethod.name ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    return builder.getManyAndCount();
  }

  create(data: Partial<PaymentMethod>): PaymentMethod {
    return this.paymentMethodRepository.create(data);
  }

  save(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(paymentMethod: PaymentMethod): Promise<void> {
    await this.paymentMethodRepository.remove(paymentMethod);
  }
}
