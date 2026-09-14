import { useNavigate, NavLink } from "react-router";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/auth/useAuth";
import Users from "@/components/icons/Users";
import Activity from "@/components/icons/Activity";
import Gear from "@/components/icons/Gear";
import ChartBar from "@/components/icons/ChartBar";
import SignOut from "@/components/icons/SignOut";
import styles from "@/styles/components/Navigation.module.scss";

const Navigation = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const username = auth.status === "authed" ? auth.user.username : "";

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            auth.clear();
            navigate("/");
        }
    };

    return (
        <nav className={styles.navigation}>
            <section className={styles.navigation_header}>
                <div>
                    <h2 className={styles.navigation_header_title}>Admin Panel</h2>
                    <p className={styles.navigation_header_subtitle}>Shop Management</p>
                </div>
                <button type="button"><div className="chevron_left" /></button>
            </section>
  
            <ul className={styles.navigation_tabs}>
                <li><NavLink to="/dashboard"><Users /> User Management</NavLink></li>
                <li><NavLink to="/activity"><Activity /> Activity Log</NavLink></li>
                <li><NavLink to="/settings"><Gear /> Settings</NavLink></li>
                <li><NavLink to="/analytics"><ChartBar /> Analytics</NavLink></li>
            </ul>
  
            <section className={styles.navigation_footer}>
                    <div className={styles.navigation_footer_user}>
                        <p className={styles.navigation_footer_user_title}>{username}</p>
                        <p className={styles.navigation_footer_user_role}>Super Admin</p>
                    </div>
                <button type="button" className={styles.navigation_sign_out} onClick={logout}><SignOut /> Sign Out</button>
            </section>
        </nav>
    )
}

export default Navigation