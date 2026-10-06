import { http } from "@/lib/http";
import type { AddUserInput, User, UserStatusCounts } from "@/types/user";

export const userApi = {
  add: (body: AddUserInput) => http.post<{ user: User }>("/user/add", body).then((r) => r.data.user),

  list: () => http.get<UserStatusCounts>("/user/status").then((r) => r.data),
};
