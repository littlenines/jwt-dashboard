import { useId } from 'react'
import type { ReactElement, InputHTMLAttributes } from 'react';
import styles from "@/styles/components/Checkbox.module.scss";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string | ReactElement;
};

const Checkbox = ({ label, ...props }: CheckboxProps) => {
    const id = useId();

    return (
        <label htmlFor={id} className={styles.checkbox}>
            <input type="checkbox" id={id} className={styles.checkbox_input} {...props} />
            <span className={styles.checkbox_box} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            {label}
        </label>
    )
}

export default Checkbox
