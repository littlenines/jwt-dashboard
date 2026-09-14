import { type ReactNode } from "react"
import styles from "@/styles/components/Title.module.scss";

type TitleProps = {
    title: string
    description: string
    children: ReactNode
}

const Title = ({ title, description, children }: TitleProps) => {
    return (
        <section className={styles.page_info}>
            <div>
                <h1 className={styles.page_info_title}>{title}</h1>
                <p className={styles.page_info_description}>{description}</p>
            </div>
            {children}
        </section>
    )
}

export default Title