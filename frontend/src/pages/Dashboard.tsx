import { useNavigate } from "react-router";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/auth/useAuth";

const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { refetch } = auth;

  const username = auth.status === "authed" ? auth.user.username : "";

  const logout = async () => {
    await authApi.logout();
    refetch();
    navigate("/");
  };

  return (
    <main>
      <p>Welcome, {username}</p>
      <button type="button" onClick={logout}>Log out</button>
    </main>
  );
};

export default Dashboard;
