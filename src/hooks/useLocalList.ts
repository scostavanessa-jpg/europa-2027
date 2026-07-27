import { useEffect, useState } from "react";
export const useLocalList = <T extends { id: string }>(key: string, seed: T[] = []) => {
  const storageKey = `viagem-amigas:list:${key}`;
  const [items, setItems] = useState<T[]>(seed);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem(storageKey); if (raw) setItems(JSON.parse(raw)); } catch {} setLoaded(true); }, [storageKey]);
  const persist = (next: T[]) => { setItems(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {} };
  const add = (item: Omit<T, "id">) => { const withId = { ...(item as any), id: crypto.randomUUID() } as T; persist([withId, ...items]); return withId; };
  const update = (id: string, patch: Partial<T>) => persist(items.map((i) => i.id === id ? { ...i, ...patch } : i));
  const remove = (id: string) => persist(items.filter((i) => i.id !== id));
  return { items, add, update, remove, clear: () => persist([]), loaded };
};