import { PermissionResponse } from './permission.response';
import { RoleResponse } from './role.response';

export class RoleDetailResponse extends RoleResponse {
  permissions!: PermissionResponse[];
  assignedUserCount!: number;

  constructor(partial?: Partial<RoleDetailResponse>) {
    super(partial);
    Object.assign(this, partial);
  }
}
