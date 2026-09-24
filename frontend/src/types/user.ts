export type User = {
  id: string;
  email: string;
  username: string;
  lastLoginAt?: string;
  role: "staff" | "admin" | "manager";
  status: "active" | "inactive" | "suspended";

};

export type AddUserInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "staff" | "admin" | "manager";
  status: "active" | "inactive" | "suspended";
};
