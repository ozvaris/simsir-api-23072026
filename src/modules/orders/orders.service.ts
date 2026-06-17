import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CartsRepository } from '../cart/repositories/carts.repository';
import { AddressesRepository } from '../addresses/repositories/addresses.repository';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { ShippingCarrierServicesRepository } from '../shipping-carriers/repositories/shipping-carrier-services.repository';
import type { CurrentUser as CurrentUserType } from '../../common/types/current-user.type';
import { AddressType } from '../users/enums/address-type.enum';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { FulfillmentStatus } from './enums/fulfillment-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListAdminOrdersQueryDto } from './dto/list-admin-orders-query.dto';
import { ListMyOrdersQueryDto } from './dto/list-my-orders-query.dto';
import { OrderAdminActionDto } from './dto/order-admin-action.dto';
import { toOrderDetailResponse, toOrderSummaryResponse } from './mappers/orders.mapper';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderListResponse } from './responses/order-list.response';
import { OrderDetailResponse } from './responses/order-detail.response';
import { OrderSummaryResponse } from './responses/order-summary.response';
import { ShippingOption } from './enums/shipping-option.enum';
import { OrderPaymentSnapshot } from './entities/order-payment-snapshot.entity';
import { OrderShipmentSnapshot } from './entities/order-shipment-snapshot.entity';
import { OrderAddress } from './entities/order-address.entity';
import { OrderAddressRole } from './enums/order-address-role.enum';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderStatusType } from './enums/order-status-type.enum';
import { OrderItem } from './entities/order-item.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryReservation } from '../inventory/entities/inventory-reservation.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { InventoryReservationStatus } from '../inventory/enums/inventory-reservation-status.enum';
import { InventoryTransactionType } from '../inventory/enums/inventory-transaction-type.enum';
import { PaymentMethodCode } from '../../common/enums/payment-method-code.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersRepository: OrdersRepository,
    private readonly cartsRepository: CartsRepository,
    private readonly addressesRepository: AddressesRepository,
    private readonly paymentMethodsService: PaymentMethodsService,
    private readonly shippingCarrierServicesRepository: ShippingCarrierServicesRepository,
  ) {}

  async listMyOrders(
    userId: string,
    query: ListMyOrdersQueryDto,
  ): Promise<OrderListResponse<OrderSummaryResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [orders, totalItems] = await this.ordersRepository.listMyOrders(
      userId,
      query,
    );

    return new OrderListResponse({
      items: orders.map((order) => toOrderSummaryResponse(order)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  }

  async getMyOrderDetail(
    userId: string,
    orderId: string,
  ): Promise<OrderDetailResponse> {
    const order = await this.ordersRepository.findMyOrderById(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return toOrderDetailResponse(order);
  }

  async listAdminOrders(
    query: ListAdminOrdersQueryDto,
  ): Promise<OrderListResponse<OrderSummaryResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [orders, totalItems] = await this.ordersRepository.listAdmin(query);

    return new OrderListResponse({
      items: orders.map((order) =>
        toOrderSummaryResponse(order, { includeCustomer: true }),
      ),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  }

  async getAdminOrderDetail(orderId: string): Promise<OrderDetailResponse> {
    const order = await this.ordersRepository.findAdminOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return toOrderDetailResponse(order, { includeCustomer: true });
  }

  async createOrder(
    user: CurrentUserType,
    dto: CreateOrderDto,
  ): Promise<OrderDetailResponse> {
    const cart = await this.cartsRepository.getOrCreateActiveCartDetail(user.userId);

    if (!cart.items?.length) {
      throw new ConflictException('Cart is empty');
    }

    const shippingAddress = await this.addressesRepository.findByIdAndUserId(
      dto.shippingAddressId,
      user.userId,
    );
    const billingAddress = await this.addressesRepository.findByIdAndUserId(
      dto.billingAddressId,
      user.userId,
    );

    if (!shippingAddress || shippingAddress.type !== AddressType.SHIPPING) {
      throw new NotFoundException('Shipping address not found');
    }

    if (!billingAddress || billingAddress.type !== AddressType.BILLING) {
      throw new NotFoundException('Billing address not found');
    }

    const shippingService =
      await this.shippingCarrierServicesRepository.findActivePublicById(
        dto.shippingServiceId,
      );

    if (!shippingService) {
      throw new NotFoundException('Shipping service not found');
    }

    const availablePaymentMethods = await this.paymentMethodsService.listPublic({
      shippingServiceId: dto.shippingServiceId,
    });
    const paymentMethod = availablePaymentMethods.items.find(
      (item) => item.id === dto.paymentMethodId,
    );

    if (!paymentMethod || paymentMethod.isSelectable === false) {
      throw new ConflictException(
        'Selected payment method is not available for the chosen shipping service',
      );
    }

    const itemContexts = cart.items.map((item) => {
      const product = item.product;

      if (!product) {
        throw new NotFoundException('Cart product not found');
      }

      return {
        cartItem: item,
        product,
      };
    });

    const trackedProductIds = itemContexts
      .filter((item) => item.product.isTrackedInventory)
      .map((item) => item.product.id);

    const inventoryItemsByProductId = new Map<string, InventoryItem>();

    if (trackedProductIds.length > 0) {
      const inventoryItems = await this.dataSource.getRepository(InventoryItem).find({
        where: trackedProductIds.map((productId) => ({ productId })),
      });

      for (const inventoryItem of inventoryItems) {
        inventoryItemsByProductId.set(inventoryItem.productId, inventoryItem);
      }
    }

    let subtotal = 0;
    let discountTotal = 0;

    for (const item of itemContexts) {
      const line = this.calculateCartLine(
        Number(item.product.price),
        Number(item.product.discount),
        item.cartItem.quantity,
      );

      subtotal += line.lineSubtotal;
      discountTotal += line.discountTotal;

      if (!item.product.isTrackedInventory) {
        continue;
      }

      const inventoryItem = inventoryItemsByProductId.get(item.product.id);

      if (!inventoryItem) {
        throw new ConflictException(
          `Tracked inventory record not found for product ${item.product.slug}`,
        );
      }

      const availableQuantity =
        inventoryItem.onHandQuantity - inventoryItem.reservedQuantity;

      if (availableQuantity < item.cartItem.quantity) {
        throw new ConflictException(
          `Insufficient inventory for product ${item.product.slug}`,
        );
      }
    }

    const shippingFee = Number(shippingService.price);
    const grandTotal = this.roundMoney(subtotal - discountTotal + shippingFee);
    const initialPaymentStatus = this.getInitialPaymentStatus(paymentMethod.code);
    const orderNumber = this.generateOrderNumber();
    const notes = dto.notes?.trim() || null;

    const createdOrderId = await this.dataSource.transaction(async (manager) => {
      const order = await manager.save(
        Order,
        manager.create(Order, {
          orderNumber,
          userId: user.userId,
          orderStatus: OrderStatus.PENDING,
          paymentStatus: initialPaymentStatus,
          fulfillmentStatus: FulfillmentStatus.PENDING,
          currency: shippingService.currency,
          subtotal: subtotal.toFixed(2),
          discountTotal: discountTotal.toFixed(2),
          shippingFee: shippingFee.toFixed(2),
          grandTotal: grandTotal.toFixed(2),
          paymentMethodId: paymentMethod.id,
          paymentProviderId: null,
          shippingCarrierId: shippingService.shippingCarrierId,
          shippingCarrierServiceId: shippingService.id,
          notes,
          createdById: user.userId,
          createdByName: this.toActorName(user),
          updatedById: user.userId,
          updatedByName: this.toActorName(user),
        }),
      );

      await manager.save(
        OrderPaymentSnapshot,
        manager.create(OrderPaymentSnapshot, {
          orderId: order.id,
          paymentMethodId: paymentMethod.id,
          paymentMethodCodeSnapshot: paymentMethod.code,
          paymentMethodNameSnapshot: paymentMethod.name,
          paymentProviderId: null,
          paymentProviderCodeSnapshot: null,
          paymentProviderNameSnapshot: null,
          paymentProviderTypeSnapshot: null,
          providerConfigSnapshot: null,
          createdById: user.userId,
          createdByName: this.toActorName(user),
          updatedById: user.userId,
          updatedByName: this.toActorName(user),
        }),
      );

      await manager.save(
        OrderShipmentSnapshot,
        manager.create(OrderShipmentSnapshot, {
          orderId: order.id,
          shippingOption: ShippingOption.CARRIER,
          shippingCarrierId: shippingService.shippingCarrierId,
          shippingCarrierCodeSnapshot: shippingService.shippingCarrier.code,
          shippingCarrierNameSnapshot: shippingService.shippingCarrier.name,
          shippingCarrierServiceId: shippingService.id,
          shippingCarrierServiceCodeSnapshot: shippingService.code,
          shippingCarrierServiceNameSnapshot: shippingService.name,
          estimatedDeliveryText: shippingService.estimatedDeliveryText,
          trackingNumber: null,
          shipmentPrice: shippingService.price,
          currency: shippingService.currency,
          createdById: user.userId,
          createdByName: this.toActorName(user),
          updatedById: user.userId,
          updatedByName: this.toActorName(user),
        }),
      );

      await manager.save(OrderAddress, [
        this.createOrderAddress(manager, order.id, OrderAddressRole.SHIPPING, shippingAddress, user),
        this.createOrderAddress(manager, order.id, OrderAddressRole.BILLING, billingAddress, user),
      ]);

      await manager.save(OrderStatusHistory, [
        this.createStatusHistoryEntry(
          manager,
          order.id,
          OrderStatusType.ORDER,
          null,
          OrderStatus.PENDING,
          'Order created',
          user,
        ),
        this.createStatusHistoryEntry(
          manager,
          order.id,
          OrderStatusType.PAYMENT,
          null,
          initialPaymentStatus,
          'Initial payment status created',
          user,
        ),
        this.createStatusHistoryEntry(
          manager,
          order.id,
          OrderStatusType.FULFILLMENT,
          null,
          FulfillmentStatus.PENDING,
          'Initial fulfillment status created',
          user,
        ),
      ]);

      for (const item of itemContexts) {
        const line = this.calculateCartLine(
          Number(item.product.price),
          Number(item.product.discount),
          item.cartItem.quantity,
        );

        const orderItem = await manager.save(
          OrderItem,
          manager.create(OrderItem, {
            orderId: order.id,
            productId: item.product.id,
            quantity: item.cartItem.quantity,
            unitPrice: Number(item.product.price).toFixed(2),
            discountAmount: line.discountTotal.toFixed(2),
            lineSubtotal: line.lineSubtotal.toFixed(2),
            lineTotal: line.lineTotal.toFixed(2),
            productTitleSnapshot: item.product.title,
            productSlugSnapshot: item.product.slug,
            brandNameSnapshot: item.product.brandName,
            productImageSnapshot: item.product.imgUrl,
            createdById: user.userId,
            createdByName: this.toActorName(user),
            updatedById: user.userId,
            updatedByName: this.toActorName(user),
          }),
        );

        if (!item.product.isTrackedInventory) {
          continue;
        }

        const inventoryItem = inventoryItemsByProductId.get(item.product.id)!;
        inventoryItem.reservedQuantity += item.cartItem.quantity;
        inventoryItemsByProductId.set(item.product.id, inventoryItem);

        await manager.save(
          InventoryItem,
          manager.merge(InventoryItem, inventoryItem, {
            updatedById: user.userId,
            updatedByName: this.toActorName(user),
          }),
        );

        const reservation = await manager.save(
          InventoryReservation,
          manager.create(InventoryReservation, {
            inventoryItemId: inventoryItem.id,
            orderId: order.id,
            orderItemId: orderItem.id,
            quantity: item.cartItem.quantity,
            status: InventoryReservationStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            note: `Reserved for ${order.orderNumber}`,
            createdById: user.userId,
            createdByName: this.toActorName(user),
            updatedById: user.userId,
            updatedByName: this.toActorName(user),
          }),
        );

        await manager.save(
          InventoryTransaction,
          manager.create(InventoryTransaction, {
            inventoryItemId: inventoryItem.id,
            reservationId: reservation.id,
            orderId: order.id,
            orderItemId: orderItem.id,
            type: InventoryTransactionType.RESERVE,
            quantity: item.cartItem.quantity,
            note: `Reserved for ${order.orderNumber}`,
            createdById: user.userId,
            createdByName: this.toActorName(user),
            updatedById: user.userId,
            updatedByName: this.toActorName(user),
          }),
        );
      }

      await manager.delete(CartItem, { cartId: cart.id });

      return order.id;
    });

    return this.getMyOrderDetail(user.userId, createdOrderId);
  }

  async cancelMyOrder(
    user: CurrentUserType,
    orderId: string,
  ): Promise<OrderDetailResponse> {
    const order = await this.ordersRepository.findMyOrderById(orderId, user.userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.cancelOrderWithActor(user, order, 'Order cancelled by customer');

    return this.getMyOrderDetail(user.userId, orderId);
  }

  async confirmOrderByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.orderStatus !== OrderStatus.PENDING) {
      throw new ConflictException('Only pending orders can be confirmed');
    }

    await this.dataSource.transaction(async (manager) => {
      await this.updateOrderStatus(
        manager,
        order,
        user,
        OrderStatus.CONFIRMED,
        dto.note?.trim() || 'Order confirmed by admin',
      );
    });

    return this.getAdminOrderDetail(orderId);
  }

  async markReadyForShipmentByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.orderStatus !== OrderStatus.CONFIRMED) {
      throw new ConflictException(
        'Only confirmed orders can be marked ready for shipment',
      );
    }

    if (order.fulfillmentStatus !== FulfillmentStatus.PENDING) {
      throw new ConflictException(
        'Only orders with pending fulfillment can be marked ready for shipment',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.updateFulfillmentStatus(
        manager,
        order,
        user,
        FulfillmentStatus.READY_FOR_SHIPMENT,
        dto.note?.trim() || 'Order marked ready for shipment',
      );
    });

    return this.getAdminOrderDetail(orderId);
  }

  async handOverOrderByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.orderStatus !== OrderStatus.CONFIRMED) {
      throw new ConflictException('Only confirmed orders can be handed over');
    }

    if (order.fulfillmentStatus !== FulfillmentStatus.READY_FOR_SHIPMENT) {
      throw new ConflictException(
        'Only ready-for-shipment orders can be handed over',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.trackingNumber?.trim()) {
        const shipmentSnapshot = await manager.findOne(OrderShipmentSnapshot, {
          where: { orderId: order.id },
        });

        if (shipmentSnapshot) {
          shipmentSnapshot.trackingNumber = dto.trackingNumber.trim();
          shipmentSnapshot.updatedById = user.userId;
          shipmentSnapshot.updatedByName = this.toActorName(user);
          await manager.save(OrderShipmentSnapshot, shipmentSnapshot);
        }
      }

      await this.updateFulfillmentStatus(
        manager,
        order,
        user,
        FulfillmentStatus.HANDED_OVER,
        dto.note?.trim() || 'Order handed over for shipment',
      );
    });

    return this.getAdminOrderDetail(orderId);
  }

  async markDeliveredByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.orderStatus !== OrderStatus.CONFIRMED) {
      throw new ConflictException('Only confirmed orders can be delivered');
    }

    if (order.fulfillmentStatus !== FulfillmentStatus.HANDED_OVER) {
      throw new ConflictException(
        'Only handed-over orders can be marked delivered',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.commitActiveReservationsForOrder(manager, order, user);

      await this.updateFulfillmentStatus(
        manager,
        order,
        user,
        FulfillmentStatus.DELIVERED,
        dto.note?.trim() || 'Order marked delivered',
      );

      await this.updateOrderStatus(
        manager,
        order,
        user,
        OrderStatus.COMPLETED,
        dto.note?.trim() || 'Order completed after delivery',
      );

      if (
        order.paymentStatus === PaymentStatus.UNPAID &&
        this.isCashOnDeliveryMethod(
          order.paymentSnapshot?.paymentMethodCodeSnapshot ?? null,
        )
      ) {
        await this.updatePaymentStatus(
          manager,
          order,
          user,
          PaymentStatus.PAID,
          dto.note?.trim() || 'Payment marked paid on delivery',
        );
      }
    });

    return this.getAdminOrderDetail(orderId);
  }

  async markDeliveryFailedByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.orderStatus !== OrderStatus.CONFIRMED) {
      throw new ConflictException(
        'Only confirmed orders can be marked delivery failed',
      );
    }

    if (order.fulfillmentStatus !== FulfillmentStatus.HANDED_OVER) {
      throw new ConflictException(
        'Only handed-over orders can be marked delivery failed',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.releaseActiveReservationsForOrder(
        manager,
        order,
        user,
        `Released after delivery failure of ${order.orderNumber}`,
      );

      await this.updateFulfillmentStatus(
        manager,
        order,
        user,
        FulfillmentStatus.DELIVERY_FAILED,
        dto.note?.trim() || 'Delivery marked failed',
      );
    });

    return this.getAdminOrderDetail(orderId);
  }

  async markReturnedByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.fulfillmentStatus !== FulfillmentStatus.DELIVERED) {
      throw new ConflictException('Only delivered orders can be marked returned');
    }

    await this.dataSource.transaction(async (manager) => {
      await this.updateFulfillmentStatus(
        manager,
        order,
        user,
        FulfillmentStatus.RETURNED,
        dto.note?.trim() || 'Order marked returned',
      );
    });

    return this.getAdminOrderDetail(orderId);
  }

  async restockReturnedItemsByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    if (order.fulfillmentStatus !== FulfillmentStatus.RETURNED) {
      throw new ConflictException(
        'Only returned orders can have items restocked',
      );
    }

    const alreadyRestocked = await this.dataSource.getRepository(
      InventoryTransaction,
    ).findOne({
      where: {
        orderId,
        type: InventoryTransactionType.RETURN_RESTOCK,
      },
    });

    if (alreadyRestocked) {
      throw new ConflictException('Returned items are already restocked');
    }

    await this.dataSource.transaction(async (manager) => {
      const committedReservations = await manager.find(InventoryReservation, {
        where: {
          orderId: order.id,
          status: InventoryReservationStatus.COMMITTED,
        },
        relations: {
          inventoryItem: true,
        },
      });

      for (const reservation of committedReservations) {
        if (!reservation.inventoryItem) {
          continue;
        }

        reservation.inventoryItem.onHandQuantity += reservation.quantity;
        reservation.inventoryItem.updatedById = user.userId;
        reservation.inventoryItem.updatedByName = this.toActorName(user);
        await manager.save(InventoryItem, reservation.inventoryItem);

        await manager.save(
          InventoryTransaction,
          manager.create(InventoryTransaction, {
            inventoryItemId: reservation.inventoryItemId,
            reservationId: reservation.id,
            orderId: reservation.orderId,
            orderItemId: reservation.orderItemId,
            type: InventoryTransactionType.RETURN_RESTOCK,
            quantity: reservation.quantity,
            note:
              dto.note?.trim() ||
              `Restocked after return of ${order.orderNumber}`,
            createdById: user.userId,
            createdByName: this.toActorName(user),
            updatedById: user.userId,
            updatedByName: this.toActorName(user),
          }),
        );
      }
    });

    return this.getAdminOrderDetail(orderId);
  }

  async cancelOrderByAdmin(
    user: CurrentUserType,
    orderId: string,
    dto: OrderAdminActionDto,
  ): Promise<OrderDetailResponse> {
    const order = await this.getAdminManagedOrderOrThrow(orderId);

    await this.cancelOrderWithActor(
      user,
      order,
      dto.note?.trim() || 'Order cancelled by admin',
    );

    return this.getAdminOrderDetail(orderId);
  }

  private calculateCartLine(unitPrice: number, discount: number, quantity: number) {
    const lineSubtotal = this.roundMoney(unitPrice * quantity);
    const finalUnitPrice = this.roundMoney(unitPrice * (1 - discount / 100));
    const lineTotal = this.roundMoney(finalUnitPrice * quantity);

    return {
      lineSubtotal,
      lineTotal,
      discountTotal: this.roundMoney(lineSubtotal - lineTotal),
    };
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private async getAdminManagedOrderOrThrow(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findAdminOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private getInitialPaymentStatus(paymentMethodCode: string): PaymentStatus {
    if (paymentMethodCode === PaymentMethodCode.CREDIT_CARD) {
      return PaymentStatus.PENDING;
    }

    return PaymentStatus.UNPAID;
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private isCashOnDeliveryMethod(paymentMethodCode: string | null): boolean {
    return (
      paymentMethodCode === PaymentMethodCode.CASH_ON_DELIVERY ||
      paymentMethodCode === PaymentMethodCode.CARD_ON_DELIVERY
    );
  }

  private toActorName(user: CurrentUserType): string {
    return `${user.name} ${user.surname}`.trim() || user.userName || user.email;
  }

  private createOrderAddress(
    manager: DataSource['manager'],
    orderId: string,
    addressRole: OrderAddressRole,
    address: {
      label: string;
      fullName: string;
      phone: string;
      country: string;
      city: string;
      state: string | null;
      zip: string | null;
      addressLine1: string;
      addressLine2: string | null;
    },
    user: CurrentUserType,
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
      createdById: user.userId,
      createdByName: this.toActorName(user),
      updatedById: user.userId,
      updatedByName: this.toActorName(user),
    });
  }

  private createStatusHistoryEntry(
    manager: DataSource['manager'],
    orderId: string,
    statusType: OrderStatusType,
    fromValue: string | null,
    toValue: string,
    note: string,
    user: CurrentUserType,
  ): OrderStatusHistory {
    return manager.create(OrderStatusHistory, {
      orderId,
      statusType,
      fromValue,
      toValue,
      note,
      createdById: user.userId,
      createdByName: this.toActorName(user),
      updatedById: user.userId,
      updatedByName: this.toActorName(user),
    });
  }

  private async updateOrderStatus(
    manager: DataSource['manager'],
    order: Order,
    user: CurrentUserType,
    nextStatus: OrderStatus,
    note: string,
  ): Promise<void> {
    const previousStatus = order.orderStatus;

    if (previousStatus === nextStatus) {
      return;
    }

    order.orderStatus = nextStatus;
    order.updatedById = user.userId;
    order.updatedByName = this.toActorName(user);

    await manager.save(Order, order);
    await manager.save(
      OrderStatusHistory,
      this.createStatusHistoryEntry(
        manager,
        order.id,
        OrderStatusType.ORDER,
        previousStatus,
        nextStatus,
        note,
        user,
      ),
    );
  }

  private async updatePaymentStatus(
    manager: DataSource['manager'],
    order: Order,
    user: CurrentUserType,
    nextStatus: PaymentStatus,
    note: string,
  ): Promise<void> {
    const previousStatus = order.paymentStatus;

    if (previousStatus === nextStatus) {
      return;
    }

    order.paymentStatus = nextStatus;
    order.updatedById = user.userId;
    order.updatedByName = this.toActorName(user);

    await manager.save(Order, order);
    await manager.save(
      OrderStatusHistory,
      this.createStatusHistoryEntry(
        manager,
        order.id,
        OrderStatusType.PAYMENT,
        previousStatus,
        nextStatus,
        note,
        user,
      ),
    );
  }

  private async updateFulfillmentStatus(
    manager: DataSource['manager'],
    order: Order,
    user: CurrentUserType,
    nextStatus: FulfillmentStatus,
    note: string,
  ): Promise<void> {
    const previousStatus = order.fulfillmentStatus;

    if (previousStatus === nextStatus) {
      return;
    }

    order.fulfillmentStatus = nextStatus;
    order.updatedById = user.userId;
    order.updatedByName = this.toActorName(user);

    await manager.save(Order, order);
    await manager.save(
      OrderStatusHistory,
      this.createStatusHistoryEntry(
        manager,
        order.id,
        OrderStatusType.FULFILLMENT,
        previousStatus,
        nextStatus,
        note,
        user,
      ),
    );
  }

  private async cancelOrderWithActor(
    user: CurrentUserType,
    order: Order,
    note: string,
  ): Promise<void> {
    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new ConflictException('Order is already cancelled');
    }

    if (order.orderStatus === OrderStatus.COMPLETED) {
      throw new ConflictException('Completed orders cannot be cancelled');
    }

    if (
      order.fulfillmentStatus !== FulfillmentStatus.PENDING &&
      order.fulfillmentStatus !== FulfillmentStatus.READY_FOR_SHIPMENT &&
      order.fulfillmentStatus !== FulfillmentStatus.DELIVERY_FAILED
    ) {
      throw new ConflictException(
        'This order can no longer be cancelled in its current fulfillment state',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      await this.updateOrderStatus(
        manager,
        order,
        user,
        OrderStatus.CANCELLED,
        note,
      );

      await this.releaseActiveReservationsForOrder(
        manager,
        order,
        user,
        `Released after cancellation of ${order.orderNumber}`,
      );
    });
  }

  private async releaseActiveReservationsForOrder(
    manager: DataSource['manager'],
    order: Order,
    user: CurrentUserType,
    note: string,
  ): Promise<void> {
    const activeReservations = await manager.find(InventoryReservation, {
      where: {
        orderId: order.id,
        status: InventoryReservationStatus.ACTIVE,
      },
      relations: {
        inventoryItem: true,
      },
    });

    for (const reservation of activeReservations) {
      if (!reservation.inventoryItem) {
        continue;
      }

      reservation.status = InventoryReservationStatus.RELEASED;
      reservation.expiresAt = null;
      reservation.note = note;
      reservation.updatedById = user.userId;
      reservation.updatedByName = this.toActorName(user);
      await manager.save(InventoryReservation, reservation);

      reservation.inventoryItem.reservedQuantity = Math.max(
        0,
        reservation.inventoryItem.reservedQuantity - reservation.quantity,
      );
      reservation.inventoryItem.updatedById = user.userId;
      reservation.inventoryItem.updatedByName = this.toActorName(user);
      await manager.save(InventoryItem, reservation.inventoryItem);

      await manager.save(
        InventoryTransaction,
        manager.create(InventoryTransaction, {
          inventoryItemId: reservation.inventoryItemId,
          reservationId: reservation.id,
          orderId: reservation.orderId,
          orderItemId: reservation.orderItemId,
          type: InventoryTransactionType.RELEASE,
          quantity: reservation.quantity,
          note,
          createdById: user.userId,
          createdByName: this.toActorName(user),
          updatedById: user.userId,
          updatedByName: this.toActorName(user),
        }),
      );
    }
  }

  private async commitActiveReservationsForOrder(
    manager: DataSource['manager'],
    order: Order,
    user: CurrentUserType,
  ): Promise<void> {
    const activeReservations = await manager.find(InventoryReservation, {
      where: {
        orderId: order.id,
        status: InventoryReservationStatus.ACTIVE,
      },
      relations: {
        inventoryItem: true,
      },
    });

    for (const reservation of activeReservations) {
      if (!reservation.inventoryItem) {
        continue;
      }

      reservation.status = InventoryReservationStatus.COMMITTED;
      reservation.expiresAt = null;
      reservation.note = `Committed after delivery of ${order.orderNumber}`;
      reservation.updatedById = user.userId;
      reservation.updatedByName = this.toActorName(user);
      await manager.save(InventoryReservation, reservation);

      reservation.inventoryItem.reservedQuantity = Math.max(
        0,
        reservation.inventoryItem.reservedQuantity - reservation.quantity,
      );
      reservation.inventoryItem.onHandQuantity = Math.max(
        0,
        reservation.inventoryItem.onHandQuantity - reservation.quantity,
      );
      reservation.inventoryItem.updatedById = user.userId;
      reservation.inventoryItem.updatedByName = this.toActorName(user);
      await manager.save(InventoryItem, reservation.inventoryItem);

      await manager.save(
        InventoryTransaction,
        manager.create(InventoryTransaction, {
          inventoryItemId: reservation.inventoryItemId,
          reservationId: reservation.id,
          orderId: reservation.orderId,
          orderItemId: reservation.orderItemId,
          type: InventoryTransactionType.COMMIT,
          quantity: reservation.quantity,
          note: `Committed after delivery of ${order.orderNumber}`,
          createdById: user.userId,
          createdByName: this.toActorName(user),
          updatedById: user.userId,
          updatedByName: this.toActorName(user),
        }),
      );
    }
  }
}
