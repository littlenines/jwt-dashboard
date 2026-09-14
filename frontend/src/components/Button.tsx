import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "@/styles/components/Button.module.scss";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ReactNode;
};

const Button = ({ icon, children, ...props }: ButtonProps) => {
    return (
        <button type="button" className={styles.button} {...props}>
            {icon}
            {children}
        </button>
    )
}

export default Button
