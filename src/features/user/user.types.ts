export type AddUserConflict = { conflict: "email" | "username" };

export type UserStatusCounts = {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}
