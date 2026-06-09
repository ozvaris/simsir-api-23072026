import { RoleResponse } from './role.response';

export class UserRoleResponse {
  userId!: string;
  roles!: RoleResponse[];
  permissions?: string[];

  constructor(partial?: Partial<UserRoleResponse>) {
    Object.assign(this, partial);
  }
}
