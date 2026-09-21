import type { ReactNode } from "react";
import styles from "@/styles/components/Table.module.scss";

export type TableColumn<T> = {
    key: string;
    header: string;
    render: (row: T) => ReactNode;
};

type TableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
    getRowKey: (row: T) => string | number;
    emptyMessage?: string;
};

const Table = <T,>({ columns, data, getRowKey, emptyMessage = "No data yet." }: TableProps<T>) => {
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.key}>{column.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length}>{emptyMessage}</td>
                    </tr>
                ) : (
                    data.map((row) => (
                        <tr key={getRowKey(row)}>
                            {columns.map((column) => (
                                <td key={column.key}>{column.render(row)}</td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}

export default Table
