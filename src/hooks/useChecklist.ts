import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const useChecklist = (key: string) => {
  const { user } = useAuth();
  const storageKey = useMemo(() => `europa2027:${user?.id ?? "anonymous"}:checklist:${key}`, [user?.id, key]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setChecked(raw ? JSON.parse(raw) : {});
    } catch {
      setChecked({});
    }
  }, [storageKey, user?.id]);

  const persist = (next: Record<string, boolean>) => {
    setChecked(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  return {
    checked,
    toggle: (id: string) => persist({ ...checked, [id]: !checked[id] }),
    reset: () => persist({}),
  };
};
