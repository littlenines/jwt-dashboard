import { createContext } from "react";
import type { User } from "@/types/auth";

export type AuthState =
  | { status: "loading" }
  | { status: "authed"; user: User }
  | { status: "guest" };

export type AuthContextValue = AuthState & {
  refetch: () => void;
  clear: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
