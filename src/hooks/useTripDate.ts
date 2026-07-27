import { useEffect, useState } from "react";
const KEY = "viagem-amigas:trip-date";
const DEFAULT_ISO = "2027-10-08T22:00:00-03:00";
let listeners: Array<() => void> = [];
let current = DEFAULT_ISO;
let loaded = false;
const load = () => { if (loaded) return; loaded = true; try { current = localStorage.getItem(KEY) || DEFAULT_ISO; } catch {} };
const persist = (iso: string) => { current = iso; try { localStorage.setItem(KEY, iso); } catch {} listeners.forEach((l) => l()); };
export const useTripDate = () => { load(); const [, force] = useState(0); useEffect(() => { const fn = () => force((n) => n + 1); listeners.push(fn); return () => { listeners = listeners.filter((l) => l !== fn); }; }, []); return { iso: current, date: new Date(current), set: persist, reset: () => persist(DEFAULT_ISO) }; };