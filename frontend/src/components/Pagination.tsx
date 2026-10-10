import Button from "@/components/Button";
import Select from "@/components/Select";
import styles from "@/styles/components/Pagination.module.scss";

const pageSizeOptions = [
    { label: "10 / page", value: "10" },
    { label: "20 / page", value: "20" },
    { label: "50 / page", value: "50" },
];

type PaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const handlePageSizeChange = (value: string) => onPageSizeChange(Number(value));

    return (
        <div className={styles.pagination}>
            <Select
                options={pageSizeOptions}
                value={String(pageSize)}
                onChange={handlePageSizeChange}
                className={styles.pagination_size}
            />

            <span className={styles.pagination_info}>Page {page} of {totalPages}</span>

            <div className={styles.pagination_controls}>
                <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                    Previous
                </Button>
                <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                    Next
                </Button>
            </div>
        </div>
    )
}

export default Pagination
