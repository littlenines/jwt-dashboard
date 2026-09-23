import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import Eye from "@/components/icons/Eye";
import EyeOff from "@/components/icons/EyeOff";
import styles from "@/styles/components/Field.module.scss";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

const Field = ({ label, id, type, ...props }: FieldProps) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className={styles.field}>
            <label htmlFor={fieldId}>{label}</label>
            <div className={styles.field_input}>
                <input id={fieldId} type={inputType} {...props} />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.field_toggle}
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Field
