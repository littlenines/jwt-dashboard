import { useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/api/auth";
import { AuthContext, type AuthState } from "./authContext";

// State layer: holds the session. Asks the data layer "who am I" on mount;
// components read it via useAuth().

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const load = () =>
    authApi
      .me()
      .then((user) => setState({ status: "authed", user }))
      .catch(() => setState({ status: "guest" }));

  useEffect(() => {
    void load();
  }, []);

  const refetch = () => {
    setState({ status: "loading" });
    void load();
  };

  const clear = () => setState({ status: "guest" });

  return (
    <AuthContext.Provider value={{ ...state, refetch, clear }}>
      {children}
    </AuthContext.Provider>
  );
};
