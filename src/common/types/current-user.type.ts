// src/common/types/current-user.type.ts

export type CurrentUser = {
  userId: string;
  email: string;
  userName: string;
  name: string;
  surname: string;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
};
