export class RoleResponse {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  isSystem!: boolean;
  status!: string;

  constructor(partial?: Partial<RoleResponse>) {
    Object.assign(this, partial);
  }
}
