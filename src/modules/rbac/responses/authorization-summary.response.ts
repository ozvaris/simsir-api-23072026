export class AuthorizationSummaryResponse {
  userId!: string;
  email?: string;
  userName?: string;
  roles!: string[];
  permissions!: string[];
  isAdmin!: boolean;

  constructor(partial?: Partial<AuthorizationSummaryResponse>) {
    Object.assign(this, partial);
  }
}
