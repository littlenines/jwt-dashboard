import Table, { type TableColumn } from "@/components/Table";
import styles from "@/styles/components/UserTable.module.scss";

type User = {
    id: string;
    name: string;
    role: string;
    status: "Active" | "Inactive" | "Suspended";
    orders: number;
    totalSpent: number;
    createdAt: string;
    lastLogin: string;
};

const users: User[] = [
    { id: "1", name: "John Doe", role: "Super Admin", status: "Active", orders: 0, totalSpent: 0, createdAt: "Jan 15, 2024", lastLogin: "Sep 12, 2024" },
    { id: "2", name: "John Doe", role: "Super Admin", status: "Active", orders: 0, totalSpent: 0, createdAt: "Jan 15, 2024", lastLogin: "Sep 12, 2024" },
];

const columns: TableColumn<User>[] = [
    { key: "user", header: "User", render: (user) => user.name },
    { key: "role", header: "Role", render: (user) => user.role },
    { key: "status", header: "Status", render: (user) => user.status },
    { key: "orders", header: "Orders", render: (user) => user.orders },
    { key: "totalSpent", header: "Total Spent", render: (user) => `$${user.totalSpent.toFixed(2)}` },
    { key: "createdAt", header: "Created", render: (user) => user.createdAt },
    { key: "lastLogin", header: "Last Login", render: (user) => user.lastLogin },
];

const UserTable = () => {
    return (
        <section className={styles.user_table}>
            <div className={styles.user_table_info}>
                <h4>Users ({users.length})</h4>
                <p>A list of all users in your shop with their details and actions</p>
            </div>
            <Table columns={columns} data={users} getRowKey={(user) => user.id} />
        </section>
    )
}

export default UserTable
