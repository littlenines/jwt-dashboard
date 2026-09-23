import { useRef } from "react";
import type { ReactNode } from "react";
import Portal from "@/components/Portal";
import Close from "@/components/icons/Close";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useKeyDown } from "@/hooks/useKeyDown";
import styles from "@/styles/components/Modal.module.scss";

type ModalProps = {
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
};

const Modal = ({ title, description, onClose, children }: ModalProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, onClose);
    useKeyDown("Escape", onClose);

    return (
        <Portal>
            <div className={styles.overlay}>
                <div className={styles.modal} ref={ref}>
                    <div className={styles.modal_header}>
                        <div>
                            <h2 className={styles.modal_title}>{title}</h2>
                            {description && <p className={styles.modal_description}>{description}</p>}
                        </div>
                        <button type="button" className={styles.modal_close} onClick={onClose} aria-label="Close">
                            <Close />
                        </button>
                    </div>

                    {children}
                </div>
            </div>
        </Portal>
    )
}

export default Modal
