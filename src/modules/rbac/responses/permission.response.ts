export class PermissionResponse {
  id!: string;
  code!: string;
  name!: string;
  description!: string | null;
  resource!: string;
  action!: string;
  isSystem!: boolean;
  status!: string;

  constructor(partial?: Partial<PermissionResponse>) {
    Object.assign(this, partial);
  }
}
