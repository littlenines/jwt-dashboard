import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
  enabled = true,
) => {
  const callbackRef = useRef(onClickOutside);

  useLayoutEffect(() => {
    callbackRef.current = onClickOutside;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callbackRef.current();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, enabled]);
};
