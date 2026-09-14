import { type ReactElement } from "react";
import styles from "@/styles/components/CountCard.module.scss";

type CountCardProps = {
    title: string
    icon: ReactElement
    count: string | number
}

const CountCard = ({title, icon, count = 0}: CountCardProps) => {
  return (
    <div className={styles.count_card}>
        <div className={styles.count_card_info}>
            <p>{title} users</p>
            <span className={styles[title || 'total']}>{icon}</span>
        </div>
        <span className={`${styles.count_card_count} ${styles[title || 'total']}`}>{count}</span>
    </div>
  )
}

export default CountCard