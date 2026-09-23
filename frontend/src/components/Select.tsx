import CaretDown from "@/components/icons/CaretDown";
import Check from "@/components/icons/Check";
import Portal from "@/components/Portal";
import { useSelect } from "@/hooks/useSelect";
import { findSelectedOption, type SelectOption } from "@/lib/select";
import styles from "@/styles/components/Select.module.scss";

export type { SelectOption };

type SelectProps = {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

type SelectOptionItemProps = {
    option: SelectOption;
    active: boolean;
    onSelect: (value: string) => void;
};

const SelectOptionItem = ({ option, active, onSelect }: SelectOptionItemProps) => {
    const handleClick = () => onSelect(option.value);

    return (
        <li>
            <button type="button" className={styles.select_option} role="option" aria-selected={active} onClick={handleClick}>
                {option.label}
                {active && <Check />}
            </button>
        </li>
    )
}

const Select = ({ options, value, onChange, placeholder = "Select...", className }: SelectProps) => {
    const { open, ref, menuRef, menuStyle, toggle, selectOption } = useSelect(onChange);
    const selected = findSelectedOption(options, value);

    return (
        <div className={className ? `${styles.select} ${className}` : styles.select} ref={ref}>
            <button type="button" className={styles.select_trigger} onClick={toggle}>
                {selected?.label ?? placeholder}
                <CaretDown />
            </button>

            {open && (
                <Portal>
                    <ul className={styles.select_menu} role="listbox" ref={menuRef} style={menuStyle}>
                        {options.map((option) => (
                            <SelectOptionItem
                                key={option.value}
                                option={option}
                                active={option.value === value}
                                onSelect={selectOption}
                            />
                        ))}
                    </ul>
                </Portal>
            )}
        </div>
    )
}

export default Select
