export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  accept: boolean;
};
