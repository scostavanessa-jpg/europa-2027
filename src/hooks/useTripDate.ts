import { useEffect, useState } from "react";
const KEY = "viagem-amigas:trip-date";
const DEFAULT_ISO = "2028-03-10T22:00:00-03:00";
const LEGACY_DEFAULTS = new Set(["2028-03-31T22:00:00-03:00"]);
let listeners: Array<() => void> = [];
let current = DEFAULT_ISO;
let loaded = false;
const load = () => {
  if (loaded) return;
  loaded = true;
  try {
    const saved = localStorage.getItem(KEY);
    current = !saved || LEGACY_DEFAULTS.has(saved) ? DEFAULT_ISO : saved;
    if (saved && LEGACY_DEFAULTS.has(saved)) localStorage.setItem(KEY, DEFAULT_ISO);
  } catch {}
};
const persist = (iso: string) => { current = iso; try { localStorage.setItem(KEY, iso); } catch {} listeners.forEach((l) => l()); };
export const useTripDate = () => { load(); const [, force] = useState(0); useEffect(() => { const fn = () => force((n) => n + 1); listeners.push(fn); return () => { listeners = listeners.filter((l) => l !== fn); }; }, []); return { iso: current, date: new Date(current), set: persist, reset: () => persist(DEFAULT_ISO) }; };