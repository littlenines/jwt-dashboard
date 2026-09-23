import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "@/styles/components/Button.module.scss";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ReactNode;
    variant?: ButtonVariant;
};

const Button = ({ icon, children, variant = "primary", ...props }: ButtonProps) => {
    const className = variant === "secondary" ? `${styles.button} ${styles.secondary}` : styles.button;

    return (
        <button type="button" className={className} {...props}>
            {icon}
            {children}
        </button>
    )
}

export default Button
