import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useActiveOverlay, useClickOutside } from "@/hooks/useClickOutside";

const GAP = 6;

export const useSelect = (onChange: (value: string) => void) => {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const positionFromTrigger = (): CSSProperties => {
    const rect = ref.current!.getBoundingClientRect();
    return {
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: rect.bottom + GAP,
    };
  };

  const close = () => setOpen(false);

  const toggle = () => {
    setOpen((current) => {
      const next = !current;
      if (next && ref.current) setMenuStyle(positionFromTrigger());
      return next;
    });
  };

  const selectOption = (value: string) => {
    onChange(value);
    close();
  };

  useClickOutside([ref, menuRef], close, open);

  useActiveOverlay(menuRef, open);

  useLayoutEffect(() => {
    if (!open || !ref.current) return;

    const updatePosition = () => {
      const triggerRect = ref.current!.getBoundingClientRect();
      const menuHeight = menuRef.current?.getBoundingClientRect().height ?? 0;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const shouldFlip = spaceBelow < menuHeight + GAP && triggerRect.top > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: triggerRect.left,
        width: triggerRect.width,
        ...(shouldFlip
          ? { bottom: window.innerHeight - triggerRect.top + GAP }
          : { top: triggerRect.bottom + GAP }),
      });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return { open, ref, menuRef, menuStyle, toggle, selectOption };
};
