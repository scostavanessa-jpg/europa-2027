import { useEffect, useState } from "react";

export const useChecklist = (key: string) => {
  const storageKey = `viagem-amigas:${key}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => { try { const raw = localStorage.getItem(storageKey); if (raw) setChecked(JSON.parse(raw)); } catch {} }, [storageKey]);
  const persist = (next: Record<string, boolean>) => { setChecked(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {} };
  return { checked, toggle: (id: string) => persist({ ...checked, [id]: !checked[id] }), reset: () => persist({}) };
};