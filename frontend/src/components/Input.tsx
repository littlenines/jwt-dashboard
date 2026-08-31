import type { ReactElement, InputHTMLAttributes } from 'react';
import { useId } from 'react';
import styles from "@/styles/components/Input.module.scss";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    icon?: ReactElement;
};

const Input = ({ icon, ...props }: InputProps) => {
    const id = useId();

    return (
        <div className={styles.input_container}>
            {icon}
            <input id={id} {...props} />
        </div>
    )
}

export default Input