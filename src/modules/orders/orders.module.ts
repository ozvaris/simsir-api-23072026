import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesModule } from '../addresses/addresses.module';
import { CartModule } from '../cart/cart.module';
import { InventoryModule } from '../inventory/inventory.module';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryReservation } from '../inventory/entities/inventory-reservation.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { PaymentProvider } from '../payment-methods/entities/payment-provider.entity';
import { Product } from '../products/entities/product.entity';
import { ShippingCarriersModule } from '../shipping-carriers/shipping-carriers.module';
import { ShippingCarrierService } from '../shipping-carriers/entities/shipping-carrier-service.entity';
import { ShippingCarrier } from '../shipping-carriers/entities/shipping-carrier.entity';
import { Address } from '../users/entities/address.entity';
import { User } from '../users/entities/user.entity';
import { OrdersAdminController } from './orders-admin.controller';
import { OrdersController } from './orders.controller';
import { OrderAddress } from './entities/order-address.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderPaymentSnapshot } from './entities/order-payment-snapshot.entity';
import { OrderShipmentSnapshot } from './entities/order-shipment-snapshot.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Order } from './entities/order.entity';
import { OrdersRepository } from './repositories/orders.repository';
import { DemoOrdersSeedService } from './seed/demo-orders-seed.service';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    CartModule,
    AddressesModule,
    PaymentMethodsModule,
    ShippingCarriersModule,
    InventoryModule,
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderAddress,
      OrderStatusHistory,
      OrderPaymentSnapshot,
      OrderShipmentSnapshot,
      User,
      Address,
      Product,
      InventoryItem,
      InventoryReservation,
      InventoryTransaction,
      PaymentMethod,
      PaymentProvider,
      ShippingCarrier,
      ShippingCarrierService,
    ]),
  ],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService, OrdersRepository, DemoOrdersSeedService],
  exports: [OrdersService, OrdersRepository, TypeOrmModule],
})
export class OrdersModule {}
