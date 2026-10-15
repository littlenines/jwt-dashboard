import Table, { type TableColumn } from "@/components/Table";
import { type PaginatedUsers, type UserListItem } from "@/types/user";
import { dateFormat } from "@/util/dateFormat";
import styles from "@/styles/components/UserTable.module.scss";

const columns: TableColumn<UserListItem>[] = [
    { key: "user", header: "User", render: (user) => user.username },
    { key: "role", header: "Role", render: (user) => user.role },
    { key: "status", header: "Status", render: (user) => user.status },
    { key: "createdAt", header: "Created", render: (user) => dateFormat(user.createdAt) },
    { key: "lastLogin", header: "Last Login", render: (user) => user.lastLoginAt ? dateFormat(user.lastLoginAt) : "—" },
];

type UserTableProps = {
    data: PaginatedUsers;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

const UserTable = ({ data, page, pageSize, onPageChange, onPageSizeChange }: UserTableProps) => {

    return (
        <section className={styles.user_table}>
            <div className={styles.user_table_info}>
                <h4>Users ({data.total})</h4>
                <p>A list of all users in your shop with their details and actions</p>
            </div>
            <Table
                columns={columns}
                data={data.users}
                getRowKey={(user) => user.id}
                pagination={{
                    page,
                    pageSize,
                    total: data.total,
                    onPageChange,
                    onPageSizeChange,
                }}
            />
        </section>
    )
}

export default UserTable
