import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useChecklist = (_key: string) => {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [itemIds, setItemIds] = useState<Record<string, string>>({});
  const [existing, setExisting] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const load = async () => {
      try {
        const itemsRes = await supabase.from("checklist_items").select("id,key").eq("shared", false);
        if (itemsRes.error) throw itemsRes.error;
        const items = (itemsRes.data ?? []) as { id: string; key: string }[];
        const ids: Record<string, string> = {};
        items.forEach((item) => { ids[item.key] = item.id; });

        const statusRes = await supabase.from("checklist_status").select("item_id,completed").eq("user_id", user.id);
        if (statusRes.error) throw statusRes.error;
        const statuses = (statusRes.data ?? []) as { item_id: string; completed: boolean }[];
        const keyById = Object.fromEntries(items.map((item) => [item.id, item.key]));
        const next: Record<string, boolean> = {};
        statuses.forEach((status) => {
          const key = keyById[status.item_id];
          if (key) next[key] = Boolean(status.completed);
        });
        if (!active) return;
        setItemIds(ids);
        setExisting(new Set(statuses.map((status) => status.item_id)));
        setChecked(next);
      } catch {
        if (active) setChecked({});
      }
    };
    void load();
    return () => { active = false; };
  }, [user?.id]);

  const toggle = async (key: string) => {
    if (!user?.id) return;
    const itemId = itemIds[key];
    if (!itemId) return;
    const nextValue = !checked[key];
    const previous = checked[key];
    setChecked((current) => ({ ...current, [key]: nextValue }));
    try {
      if (existing.has(itemId)) {
        const { error } = await supabase.from("checklist_status").update({
          completed: nextValue,
          completed_at: nextValue ? new Date().toISOString() : null,
        }).eq("user_id", user.id).eq("item_id", itemId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("checklist_status").insert({
          user_id: user.id,
          item_id: itemId,
          completed: nextValue,
          completed_at: nextValue ? new Date().toISOString() : null,
        });
        if (error) throw error;
        setExisting((current) => new Set(current).add(itemId));
      }
    } catch {
      setChecked((current) => ({ ...current, [key]: Boolean(previous) }));
    }
  };

  const reset = async () => {
    if (!user?.id) return;
    const before = checked;
    setChecked({});
    try {
      const { error } = await supabase.from("checklist_status").update({ completed: false, completed_at: null }).eq("user_id", user.id);
      if (error) throw error;
    } catch {
      setChecked(before);
    }
  };

  return { checked, toggle, reset };
};
