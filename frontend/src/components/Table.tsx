import type { ReactNode } from "react";
import Pagination from "@/components/Pagination";
import styles from "@/styles/components/Table.module.scss";

export type TableColumn<T> = {
    key: string;
    header: string;
    render: (row: T) => ReactNode;
};

type TablePagination = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

type TableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
    getRowKey: (row: T) => string | number;
    emptyMessage?: string;
    pagination?: TablePagination;
};

const Table = <T,>({ columns, data, getRowKey, emptyMessage = "No data yet.", pagination }: TableProps<T>) => {
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
            {pagination && (
                <tfoot>
                    <tr>
                        <td colSpan={columns.length}>
                            <Pagination {...pagination} />
                        </td>
                    </tr>
                </tfoot>
            )}
        </table>
    )
}

export default Table
