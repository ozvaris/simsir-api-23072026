import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateInventoryAdjustmentDto } from './dto/create-inventory-adjustment.dto';
import { SetProductInventoryDto } from './dto/set-product-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('admin/products/:productId/inventory')
export class InventoryAdminController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Permissions('inventory.read')
  getInventory(@Param('productId') productId: string) {
    return this.inventoryService.getInventory(productId);
  }

  @Put()
  @Permissions('inventory.update')
  setInventory(
    @Param('productId') productId: string,
    @Body() dto: SetProductInventoryDto,
  ) {
    return this.inventoryService.setInventory(productId, dto);
  }

  @Post('adjustments')
  @Permissions('inventory.update')
  createAdjustment(
    @Param('productId') productId: string,
    @Body() dto: CreateInventoryAdjustmentDto,
  ) {
    return this.inventoryService.createAdjustment(productId, dto);
  }

  @Get('transactions')
  @Permissions('inventory.read')
  listTransactions(@Param('productId') productId: string) {
    return this.inventoryService.listTransactions(productId);
  }

  @Get('reservations')
  @Permissions('inventory.read')
  listReservations(@Param('productId') productId: string) {
    return this.inventoryService.listReservations(productId);
  }
}
