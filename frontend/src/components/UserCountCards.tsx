import CountCard from "./CountCard"
import Users from "./icons/Users"
import UserCheck from "./icons/UserCheck"
import UserX from "./icons/UserX"
import Warning from "./icons/Warning"
import styles from "@/styles/components/UserCountCards.module.scss";

const UserCountCards = () => {
    return (
        <section className={styles.user_count_cards}>
            <CountCard title="total" count={8} icon={<Users />} />
            <CountCard title="active" count={1} icon={<UserCheck />} />
            <CountCard title="inactive" count={1} icon={<UserX />} />
            <CountCard title="suspended" count={1} icon={<Warning />} />
        </section>
    )
}

export default UserCountCards;
