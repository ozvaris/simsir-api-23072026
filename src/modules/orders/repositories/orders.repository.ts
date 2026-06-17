import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListAdminOrdersQueryDto } from '../dto/list-admin-orders-query.dto';
import { ListMyOrdersQueryDto } from '../dto/list-my-orders-query.dto';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async listMyOrders(
    userId: string,
    query: ListMyOrdersQueryDto,
  ): Promise<[Order[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('order.paymentSnapshot', 'paymentSnapshot')
      .leftJoinAndSelect('order.shipmentSnapshot', 'shipmentSnapshot')
      .where('order.userId = :userId', { userId })
      .distinct(true)
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.orderStatus) {
      builder.andWhere('order.orderStatus = :orderStatus', {
        orderStatus: query.orderStatus,
      });
    }

    if (query.paymentStatus) {
      builder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: query.paymentStatus,
      });
    }

    if (query.fulfillmentStatus) {
      builder.andWhere('order.fulfillmentStatus = :fulfillmentStatus', {
        fulfillmentStatus: query.fulfillmentStatus,
      });
    }

    return builder.getManyAndCount();
  }

  findMyOrderById(orderId: string, userId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: {
        id: orderId,
        userId,
      },
      relations: {
        user: true,
        items: true,
        addresses: true,
        statusHistory: true,
        paymentSnapshot: true,
        shipmentSnapshot: true,
      },
    });
  }

  async listAdmin(query: ListAdminOrdersQueryDto): Promise<[Order[], number]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const builder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('order.paymentSnapshot', 'paymentSnapshot')
      .leftJoinAndSelect('order.shipmentSnapshot', 'shipmentSnapshot')
      .distinct(true)
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.orderStatus) {
      builder.andWhere('order.orderStatus = :orderStatus', {
        orderStatus: query.orderStatus,
      });
    }

    if (query.paymentStatus) {
      builder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: query.paymentStatus,
      });
    }

    if (query.fulfillmentStatus) {
      builder.andWhere('order.fulfillmentStatus = :fulfillmentStatus', {
        fulfillmentStatus: query.fulfillmentStatus,
      });
    }

    if (query.userId) {
      builder.andWhere('order.userId = :userId', {
        userId: query.userId,
      });
    }

    if (query.search?.trim()) {
      builder.andWhere(
        '(order.orderNumber ILIKE :search OR user.email ILIKE :search OR user.userName ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    return builder.getManyAndCount();
  }

  findAdminOrderById(orderId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        user: true,
        items: true,
        addresses: true,
        statusHistory: true,
        paymentSnapshot: true,
        shipmentSnapshot: true,
      },
    });
  }
}
