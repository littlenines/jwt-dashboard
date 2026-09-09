import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth/useAuth";

const ProtectedRoute = () => {
  const auth = useAuth();
  if (auth.status === "loading") return <p>Loading…</p>;
  if (auth.status === "guest") return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
