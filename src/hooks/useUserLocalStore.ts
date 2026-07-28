import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useUserLocalStore<T>(namespace: string, initial: T) {
  const { user } = useAuth();
  const key = useMemo(() => `europa2027:${user?.id ?? "anonymous"}:${namespace}`, [user?.id, namespace]);
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(key);
      setValue(raw ? JSON.parse(raw) : initial);
    } catch {
      setValue(initial);
    }
    setLoaded(true);
  }, [key, user?.id]);

  const update = (next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  };

  return { value, setValue: update, loaded, storageKey: key };
}

export function useGroupLocalStore<T>(namespace: string, initial: T) {
  const key = `europa2027:group:${namespace}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  const update = (next: T | ((current: T) => T)) => {
    setValue((current) => {
      const resolved = typeof next === "function" ? (next as (current: T) => T)(current) : next;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  };

  return { value, setValue: update, storageKey: key };
}
