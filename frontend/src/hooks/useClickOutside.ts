import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

type Refs = RefObject<Element | null> | RefObject<Element | null>[];

const toArray = (refs: Refs) => (Array.isArray(refs) ? refs : [refs]);

const activeOverlays = new Set<Element>();

const isInsideActiveOverlay = (target: Node) => {
  for (const el of activeOverlays) {
    if (el.contains(target)) return true;
  }
  return false;
};

export const useActiveOverlay = (ref: RefObject<Element | null>, active: boolean) => {
  useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    activeOverlays.add(el);
    return () => {
      activeOverlays.delete(el);
    };
  }, [active, ref]);
};

export const useClickOutside = (
  refs: Refs,
  onClickOutside: () => void,
  enabled = true,
) => {
  const callbackRef = useRef(onClickOutside);
  const refsRef = useRef(toArray(refs));

  useLayoutEffect(() => {
    callbackRef.current = onClickOutside;
    refsRef.current = toArray(refs);
  });

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInside =
        refsRef.current.some((ref) => ref.current?.contains(target)) || isInsideActiveOverlay(target);
      if (!isInside) callbackRef.current();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enabled]);
};
