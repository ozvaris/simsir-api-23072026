import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckoutDraft } from '../entities/checkout-draft.entity';

@Injectable()
export class CheckoutDraftsRepository {
  constructor(
    @InjectRepository(CheckoutDraft)
    private readonly checkoutDraftRepository: Repository<CheckoutDraft>,
  ) {}

  findByUserId(userId: string): Promise<CheckoutDraft | null> {
    return this.checkoutDraftRepository.findOne({
      where: { userId },
    });
  }

  create(data: Partial<CheckoutDraft>): CheckoutDraft {
    return this.checkoutDraftRepository.create(data);
  }

  save(checkoutDraft: CheckoutDraft): Promise<CheckoutDraft> {
    return this.checkoutDraftRepository.save(checkoutDraft);
  }
}
