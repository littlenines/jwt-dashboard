import { useState } from "react";
import Search from "@/components/Search";
import Select from "@/components/Select";
import styles from "@/styles/components/UserFilters.module.scss";

const roleOptions = [
    { label: "All Roles", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Staff", value: "staff" },
];

const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" },
];

const UserFilters = () => {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [status, setStatus] = useState("all");

    return (
        <div className={styles.user_filters}>
            <Search
                placeholder="Search users by name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />
            <Select options={roleOptions} value={role} onChange={setRole} />
            <Select options={statusOptions} value={status} onChange={setStatus} />
        </div>
    )
}

export default UserFilters
