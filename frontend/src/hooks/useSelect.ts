import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

export const useSelect = (onChange: (value: string) => void) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((current) => !current);

  const selectOption = (value: string) => {
    onChange(value);
    close();
  };

  useClickOutside(ref, close, open);

  return { open, ref, toggle, selectOption };
};
