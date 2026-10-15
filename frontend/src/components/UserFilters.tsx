import { useEffect, useEffectEvent, useState } from "react";
import Search from "@/components/Search";
import Select from "@/components/Select";
import { useDebounce } from "@/hooks/useDebounce";
import styles from "@/styles/components/UserFilters.module.scss";

const roleOptions = [
    { label: "All Roles", value: "" },
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Staff", value: "staff" },
];

const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" },
];

type UserFiltersProps = {
    search?: string;
    role?: string;
    status?: string;
    onSearch: (value: string) => void;
    onRole: (value: string) => void;
    onStatus: (value: string) => void;
};

const UserFilters = ({ search, role, status, onSearch, onRole, onStatus }: UserFiltersProps) => {

    const [searchInput, setSearchInput] = useState(search ?? "");
    const [prevSearch, setPrevSearch] = useState(search);
    const debouncedSearch = useDebounce(searchInput);

    if (search !== prevSearch) {
        setPrevSearch(search);
        setSearchInput(search ?? "");
    }

    const onDebouncedSearch = useEffectEvent((value: string) => {
        if (value !== (search ?? "")) onSearch(value);
    });

    useEffect(() => {
        onDebouncedSearch(debouncedSearch);
    }, [debouncedSearch]);

    return (
        <div className={styles.user_filters}>
            <Search placeholder="Search users by name or email..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)}/>
            <Select options={roleOptions} value={role ?? ""} onChange={onRole} />
            <Select options={statusOptions} value={status ?? ""} onChange={onStatus} />
        </div>
    )
}

export default UserFilters
