import { OrderStatusType } from '../enums/order-status-type.enum';

export class OrderStatusHistoryResponse {
  id!: string;
  statusType!: OrderStatusType;
  fromValue!: string | null;
  toValue!: string;
  note!: string | null;
  createdAt!: string;
}
