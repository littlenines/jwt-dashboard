import type { InputHTMLAttributes } from "react";
import MagnifyingGlass from "@/components/icons/MagnifyingGlass";
import styles from "@/styles/components/Search.module.scss";

type SearchProps = InputHTMLAttributes<HTMLInputElement>;

const Search = (props: SearchProps) => {
    return (
        <div className={styles.search}>
            <MagnifyingGlass />
            <input type="text" {...props} />
        </div>
    )
}

export default Search
