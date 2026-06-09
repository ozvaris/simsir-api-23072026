export class RolePermissionsResponse {
  roleId!: string;
  permissionCodes!: string[];

  constructor(partial?: Partial<RolePermissionsResponse>) {
    Object.assign(this, partial);
  }
}
