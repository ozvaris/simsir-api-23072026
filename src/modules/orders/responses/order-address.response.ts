import { OrderAddressRole } from '../enums/order-address-role.enum';

export class OrderAddressResponse {
  id!: string;
  addressRole!: OrderAddressRole;
  label!: string | null;
  fullName!: string;
  phone!: string;
  country!: string;
  city!: string;
  state!: string | null;
  zip!: string | null;
  addressLine1!: string;
  addressLine2!: string | null;
}
