import { useEffect, useRef } from "react";

export function useAutosave(
  value: string,
  onSave: () => void,
  intervalMs = 5000,
): void {
  const onSaveRef = useRef(onSave);
  const lastValueRef = useRef(value);
  onSaveRef.current = onSave;

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastValueRef.current !== value) {
        lastValueRef.current = value;
        onSaveRef.current();
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [value, intervalMs]);
}
