import CountCard from "./CountCard"
import Users from "./icons/Users"
import UserCheck from "./icons/UserCheck"
import UserX from "./icons/UserX"
import Warning from "./icons/Warning"
import { useUserStatuses } from "@/hooks/useUserStatuses"
import styles from "@/styles/components/UserCountCards.module.scss";

const UserCountCards = () => {

  const status = useUserStatuses()

    return (
        <section className={styles.user_count_cards}>
            <CountCard title="total" count={status.total} icon={<Users />} />
            <CountCard title="active" count={status.active} icon={<UserCheck />} />
            <CountCard title="inactive" count={status.inactive} icon={<UserX />} />
            <CountCard title="suspended" count={status.suspended} icon={<Warning />} />
        </section>
    )
}

export default UserCountCards;
