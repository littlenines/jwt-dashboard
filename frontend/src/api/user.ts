import { http } from "@/lib/http";
import type { AddUserInput, User, UserStatusCounts, PaginatedUsers } from "@/types/user";

export const userApi = {
  add: (body: AddUserInput) => http.post<{ user: User }>("/user/add", body).then((r) => r.data.user),

  status: () => http.get<UserStatusCounts>("/user/status").then((r) => r.data),

  pagination: (page: number, pageSize: number) => http.get<PaginatedUsers>("/user/pagination", { params: { page, pageSize } }).then((r) => r.data),
};
