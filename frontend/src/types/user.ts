type Role = "staff" | "admin" | "manager";
type Status = "active" | "inactive" | "suspended";

export type User = {
  id: string;
  email: string;
  username: string;
  lastLoginAt?: string;
  role: Role;
  status: Status;
};

export type AddUserInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  status: Status;
};

export type UserStatusCounts = {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
};

export type UserListItem = {
  id: string;
  username: string;
  role: Role;
  status: Status;
  createdAt: string;
  lastLoginAt: string | null;
};

export type PaginatedUsers = {
  total: number;
  users: UserListItem[];
};
