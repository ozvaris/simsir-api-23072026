export class UserRolesMutationResponse {
  userId!: string;
  roleCodes!: string[];

  constructor(partial?: Partial<UserRolesMutationResponse>) {
    Object.assign(this, partial);
  }
}
