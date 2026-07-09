import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { InventoryReservation } from '../../inventory/entities/inventory-reservation.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { InventoryReservationStatus } from '../../inventory/enums/inventory-reservation-status.enum';
import { InventoryTransactionType } from '../../inventory/enums/inventory-transaction-type.enum';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { PaymentProvider } from '../../payment-methods/entities/payment-provider.entity';
import { Product } from '../../products/entities/product.entity';
import { ShippingCarrierService } from '../../shipping-carriers/entities/shipping-carrier-service.entity';
import { ShippingCarrier } from '../../shipping-carriers/entities/shipping-carrier.entity';
import { Address } from '../../users/entities/address.entity';
import { AddressType } from '../../users/enums/address-type.enum';
import { User } from '../../users/entities/user.entity';
import { FulfillmentStatus } from '../enums/fulfillment-status.enum';
import { OrderAddressRole } from '../enums/order-address-role.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderStatusType } from '../enums/order-status-type.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ShippingOption } from '../enums/shipping-option.enum';
import { OrderAddress } from '../entities/order-address.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderPaymentSnapshot } from '../entities/order-payment-snapshot.entity';
import { OrderShipmentSnapshot } from '../entities/order-shipment-snapshot.entity';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { Order } from '../entities/order.entity';

const DEMO_ORDER_SEEDS = [
  {
    orderNumber: 'DEMO-ORDER-1001',
    userEmail: 'customer@example.com',
    paymentMethodCode: PaymentMethodCode.CASH_ON_DELIVERY,
    paymentProviderCode: null,
    shippingCarrierCode: 'yurtici_kargo',
    shippingCarrierServiceCode: 'standard_delivery',
    orderStatus: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.UNPAID,
    fulfillmentStatus: FulfillmentStatus.READY_FOR_SHIPMENT,
    items: [
      { productSlug: 'nikecourt-zoom-vapor-cage', quantity: 1 },
      { productSlug: 'tarz-t3', quantity: 2 },
    ],
    notes: 'Pending COD demo order reserved for fulfillment flow testing.',
  },
  {
    orderNumber: 'DEMO-ORDER-1002',
    userEmail: 'customer@example.com',
    paymentMethodCode: PaymentMethodCode.CASH_ON_DELIVERY,
    paymentProviderCode: null,
    shippingCarrierCode: 'hepsijet',
    shippingCarrierServiceCode: 'standard_delivery',
    orderStatus: OrderStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    fulfillmentStatus: FulfillmentStatus.DELIVERED,
    items: [{ productSlug: 'iphone-13-pro-max', quantity: 1 }],
    notes: 'Delivered COD demo order committed to inventory.',
  },
] as const;

@Injectable()
export class DemoOrdersSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoOrdersSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(InventoryItem)
    private readonly inventoryItemRepository: Repository<InventoryItem>,

    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,

    @InjectRepository(PaymentProvider)
    private readonly paymentProviderRepository: Repository<PaymentProvider>,

    @InjectRepository(ShippingCarrier)
    private readonly shippingCarrierRepository: Repository<ShippingCarrier>,

    @InjectRepository(ShippingCarrierService)
    private readonly shippingCarrierServiceRepository: Repository<ShippingCarrierService>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'demo')) {
      this.logger.log('Skipping demo order seed.');
      return;
    }

    await this.seedOrders();
  }

  private async seedOrders(): Promise<void> {
    for (const seed of DEMO_ORDER_SEEDS) {
      const existingOrder = await this.orderRepository.findOne({
        where: { orderNumber: seed.orderNumber },
      });

      if (existingOrder) {
        continue;
      }

      const user = await this.userRepository.findOne({
        where: { email: seed.userEmail },
      });

      if (!user) {
        this.logger.warn(
          `Skipping demo order ${seed.orderNumber}; user ${seed.userEmail} was not found.`,
        );
        continue;
      }

      const shippingAddress = await this.addressRepository.findOne({
        where: {
          userId: user.id,
          type: AddressType.SHIPPING,
        },
      });
      const billingAddress = await this.addressRepository.findOne({
        where: {
          userId: user.id,
          type: AddressType.BILLING,
        },
      });

      if (!shippingAddress || !billingAddress) {
        this.logger.warn(
          `Skipping demo order ${seed.orderNumber}; shipping or billing address is missing.`,
        );
        continue;
      }

      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { code: seed.paymentMethodCode },
      });

      if (!paymentMethod) {
        this.logger.warn(
          `Skipping demo order ${seed.orderNumber}; payment method ${seed.paymentMethodCode} was not found.`,
        );
        continue;
      }

      const paymentProvider = seed.paymentProviderCode
        ? await this.paymentProviderRepository.findOne({
            where: {
              paymentMethodId: paymentMethod.id,
              code: seed.paymentProviderCode,
            },
          })
        : null;

      const shippingCarrier = await this.shippingCarrierRepository.findOne({
        where: { code: seed.shippingCarrierCode },
      });

      if (!shippingCarrier) {
        this.logger.warn(
          `Skipping demo order ${seed.orderNumber}; shipping carrier ${seed.shippingCarrierCode} was not found.`,
        );
        continue;
      }

      const shippingCarrierService =
        await this.shippingCarrierServiceRepository.findOne({
          where: {
            shippingCarrierId: shippingCarrier.id,
            code: seed.shippingCarrierServiceCode,
          },
        });

      if (!shippingCarrierService) {
        this.logger.warn(
          `Skipping demo order ${seed.orderNumber}; shipping service ${seed.shippingCarrierServiceCode} was not found.`,
        );
        continue;
      }

      const itemContext: Array<{
        product: Product;
        inventoryItem: InventoryItem;
        quantity: number;
      }> = [];

      let subtotal = 0;
      let discountTotal = 0;

      let missingDependency = false;

      for (const itemSeed of seed.items) {
        const product = await this.productRepository.findOne({
          where: { slug: itemSeed.productSlug },
        });

        if (!product) {
          this.logger.warn(
            `Skipping demo order ${seed.orderNumber}; product ${itemSeed.productSlug} was not found.`,
          );
          missingDependency = true;
          break;
        }

        const inventoryItem = await this.inventoryItemRepository.findOne({
          where: { productId: product.id },
        });

        if (!inventoryItem) {
          this.logger.warn(
            `Skipping demo order ${seed.orderNumber}; inventory for ${itemSeed.productSlug} was not found.`,
          );
          missingDependency = true;
          break;
        }

        const unitPrice = Number(product.price);
        const discount = Number(product.discount);

        subtotal += unitPrice * itemSeed.quantity;
        discountTotal += discount * itemSeed.quantity;

        itemContext.push({
          product,
          inventoryItem,
          quantity: itemSeed.quantity,
        });
      }

      if (missingDependency) {
        continue;
      }

      const shippingFee = Number(shippingCarrierService.price);
      const grandTotal = subtotal - discountTotal + shippingFee;

      await this.dataSource.transaction(async (manager) => {
        const order = await manager.save(
          Order,
          manager.create(Order, {
            orderNumber: seed.orderNumber,
            userId: user.id,
            orderStatus: seed.orderStatus,
            paymentStatus: seed.paymentStatus,
            fulfillmentStatus: seed.fulfillmentStatus,
            currency: 'TRY',
            subtotal: subtotal.toFixed(2),
            discountTotal: discountTotal.toFixed(2),
            shippingFee: shippingFee.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            paymentMethodId: paymentMethod.id,
            paymentProviderId: paymentProvider?.id ?? null,
            shippingCarrierId: shippingCarrier.id,
            shippingCarrierServiceId: shippingCarrierService.id,
            notes: seed.notes,
            createdByName: 'Demo Seed',
            updatedByName: 'Demo Seed',
          }),
        );

        await manager.save(
          OrderPaymentSnapshot,
          manager.create(OrderPaymentSnapshot, {
            orderId: order.id,
            paymentMethodId: paymentMethod.id,
            paymentMethodCodeSnapshot: paymentMethod.code,
            paymentMethodNameSnapshot: paymentMethod.name,
            paymentProviderId: paymentProvider?.id ?? null,
            paymentProviderCodeSnapshot: paymentProvider?.code ?? null,
            paymentProviderNameSnapshot: paymentProvider?.name ?? null,
            paymentProviderTypeSnapshot: paymentProvider?.providerType ?? null,
            providerConfigSnapshot: null,
            createdByName: 'Demo Seed',
            updatedByName: 'Demo Seed',
          }),
        );

        await manager.save(
          OrderShipmentSnapshot,
          manager.create(OrderShipmentSnapshot, {
            orderId: order.id,
            shippingOption: ShippingOption.CARRIER,
            shippingCarrierId: shippingCarrier.id,
            shippingCarrierCodeSnapshot: shippingCarrier.code,
            shippingCarrierNameSnapshot: shippingCarrier.name,
            shippingCarrierServiceId: shippingCarrierService.id,
            shippingCarrierServiceCodeSnapshot: shippingCarrierService.code,
            shippingCarrierServiceNameSnapshot: shippingCarrierService.name,
            estimatedDeliveryText: shippingCarrierService.estimatedDeliveryText,
            trackingNumber: null,
            shipmentPrice: shippingCarrierService.price,
            currency: shippingCarrierService.currency,
            createdByName: 'Demo Seed',
            updatedByName: 'Demo Seed',
          }),
        );

        await manager.save(OrderAddress, [
          this.createOrderAddress(manager, order.id, OrderAddressRole.SHIPPING, shippingAddress),
          this.createOrderAddress(manager, order.id, OrderAddressRole.BILLING, billingAddress),
        ]);

        await manager.save(
          OrderStatusHistory,
          this.buildStatusHistoryEntries(manager, order.id, seed),
        );

        for (const item of itemContext) {
          const unitPrice = Number(item.product.price);
          const discount = Number(item.product.discount);
          const lineSubtotal = unitPrice * item.quantity;
          const lineDiscount = discount * item.quantity;
          const lineTotal = lineSubtotal - lineDiscount;

          const orderItem = await manager.save(
            OrderItem,
            manager.create(OrderItem, {
              orderId: order.id,
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.product.price,
              discountAmount: lineDiscount.toFixed(2),
              lineSubtotal: lineSubtotal.toFixed(2),
              lineTotal: lineTotal.toFixed(2),
              productTitleSnapshot: item.product.title,
              productSlugSnapshot: item.product.slug,
              brandNameSnapshot: item.product.brandName,
              productImageSnapshot: item.product.imgUrl,
              createdByName: 'Demo Seed',
              updatedByName: 'Demo Seed',
            }),
          );

          const reservationStatus =
            seed.fulfillmentStatus === FulfillmentStatus.DELIVERED
              ? InventoryReservationStatus.COMMITTED
              : InventoryReservationStatus.ACTIVE;

          const reservation = await manager.save(
            InventoryReservation,
            manager.create(InventoryReservation, {
              inventoryItemId: item.inventoryItem.id,
              orderId: order.id,
              orderItemId: orderItem.id,
              quantity: item.quantity,
              status: reservationStatus,
              expiresAt:
                reservationStatus === InventoryReservationStatus.ACTIVE
                  ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                  : null,
              note: `Reservation for ${seed.orderNumber}`,
              createdByName: 'Demo Seed',
              updatedByName: 'Demo Seed',
            }),
          );

          await manager.save(
            InventoryTransaction,
            manager.create(InventoryTransaction, {
              inventoryItemId: item.inventoryItem.id,
              reservationId: reservation.id,
              orderId: order.id,
              orderItemId: orderItem.id,
              type: InventoryTransactionType.RESERVE,
              quantity: item.quantity,
              note: `Reserved for ${seed.orderNumber}`,
              createdByName: 'Demo Seed',
              updatedByName: 'Demo Seed',
            }),
          );

          if (reservationStatus === InventoryReservationStatus.ACTIVE) {
            await manager.update(
              InventoryItem,
              item.inventoryItem.id,
              {
                reservedQuantity: item.inventoryItem.reservedQuantity + item.quantity,
                updatedByName: 'Demo Seed',
              },
            );
            continue;
          }

          await manager.update(
            InventoryItem,
            item.inventoryItem.id,
            {
              onHandQuantity: item.inventoryItem.onHandQuantity - item.quantity,
              updatedByName: 'Demo Seed',
            },
          );

          await manager.save(
            InventoryTransaction,
            manager.create(InventoryTransaction, {
              inventoryItemId: item.inventoryItem.id,
              reservationId: reservation.id,
              orderId: order.id,
              orderItemId: orderItem.id,
              type: InventoryTransactionType.COMMIT,
              quantity: item.quantity,
              note: `Committed for ${seed.orderNumber}`,
              createdByName: 'Demo Seed',
              updatedByName: 'Demo Seed',
            }),
          );
        }
      });
    }
  }

  private createOrderAddress(
    manager: DataSource['manager'],
    orderId: string,
    addressRole: OrderAddressRole,
    address: Address,
  ): OrderAddress {
    return manager.create(OrderAddress, {
      orderId,
      addressRole,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      country: address.country,
      city: address.city,
      state: address.state,
      zip: address.zip,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      createdByName: 'Demo Seed',
      updatedByName: 'Demo Seed',
    });
  }

  private buildStatusHistoryEntries(
    manager: DataSource['manager'],
    orderId: string,
    seed: (typeof DEMO_ORDER_SEEDS)[number],
  ): OrderStatusHistory[] {
    return [
      manager.create(OrderStatusHistory, {
        orderId,
        statusType: OrderStatusType.ORDER,
        fromValue: null,
        toValue: seed.orderStatus,
        note: `Seeded order status for ${seed.orderNumber}`,
        createdByName: 'Demo Seed',
        updatedByName: 'Demo Seed',
      }),
      manager.create(OrderStatusHistory, {
        orderId,
        statusType: OrderStatusType.PAYMENT,
        fromValue: null,
        toValue: seed.paymentStatus,
        note: `Seeded payment status for ${seed.orderNumber}`,
        createdByName: 'Demo Seed',
        updatedByName: 'Demo Seed',
      }),
      manager.create(OrderStatusHistory, {
        orderId,
        statusType: OrderStatusType.FULFILLMENT,
        fromValue: null,
        toValue: seed.fulfillmentStatus,
        note: `Seeded fulfillment status for ${seed.orderNumber}`,
        createdByName: 'Demo Seed',
        updatedByName: 'Demo Seed',
      }),
    ];
  }
}
