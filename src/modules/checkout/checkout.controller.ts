import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';
import { UpdateCheckoutDraftDto } from './dto/update-checkout-draft.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('draft')
  getDraft(@CurrentUser('userId') userId: string) {
    return this.checkoutService.getMyDraft(userId);
  }

  @Patch('draft')
  updateDraft(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateCheckoutDraftDto,
  ) {
    return this.checkoutService.updateMyDraft(userId, dto);
  }
}
