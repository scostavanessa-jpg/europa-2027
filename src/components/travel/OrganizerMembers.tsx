import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";

type PendingUser = { user_id: string; display_name: string | null; email: string; email_verified: boolean };
type Person = "Camila" | "Danielle";
const people: Person[] = ["Camila", "Danielle"];

export function OrganizerMembers() {
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [selected, setSelected] = useState<Record<string, Person | "">>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase.rpc("list_pending_trip_users");
      if (queryError) throw queryError;
      setPending((data ?? []) as PendingUser[]);
    } catch (e: any) {
      setError(e?.message || "Não foi possível consultar os cadastros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const approve = async (user: PendingUser) => {
    const chosenName = selected[user.user_id];
    if (!chosenName) return toast.error("Escolha Camila ou Danielle antes de vincular.");
    if (!user.email_verified) return toast.error("Esta conta precisa confirmar o e-mail antes do vínculo.");
    if (!window.confirm(`Vincular a conta ${user.email} ao perfil ${chosenName}? Confira com a viajante antes de prosseguir.`)) return;
    setBusy(user.user_id);
    try {
      const { error: approvalError } = await supabase.rpc("approve_trip_user", {
        target_user_id: user.user_id,
        chosen_name: chosenName,
      });
      if (approvalError) throw approvalError;
      toast.success(`Conta vinculada ao perfil ${chosenName}.`);
      await reload();
    } catch (e: any) {
      toast.error("Não consegui aprovar este acesso.", { description: e?.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section id="vincular" className="mt-7 rounded-3xl border border-gold/30 bg-card p-5 sm:p-7 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <ShieldCheck className="h-6 w-6 text-olive" />
        <h2 className="font-display text-2xl sm:text-3xl text-ink">Gerenciar os acessos</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Como organizadora, você aprova a associação de cada conta ao perfil correto.
        Primeiro confira com Camila ou Danielle qual e-mail realmente usaram. Não existe mais chave compartilhada.
      </p>
      {loading ? <p className="mt-5 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Consultando cadastros…</p> : error ?
        <div className="mt-5 rounded-xl border border-destructive/30 p-4 text-sm"><p>Erro ao consultar: {error}</p><Button variant="outline" className="mt-3" onClick={() => void reload()}>Tentar novamente</Button></div> :
        pending.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Nenhuma conta aguardando vínculo no momento.</p> :
        <div className="mt-5 space-y-3">
          {pending.map((person) => (
            <article key={person.user_id} className="rounded-2xl bg-secondary/40 p-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">{person.display_name || "Viajante"}</p>
                <p className="text-xs text-muted-foreground break-all">{person.email}</p>
                <p className="text-xs mt-1 text-muted-foreground">{person.email_verified ? "E-mail confirmado" : "E-mail ainda não confirmado"}</p>
              </div>
              <div className="grid sm:grid-cols-[1fr_auto] items-end gap-3 mt-3">
                <div>
                  <Label htmlFor={`person-${person.user_id}`}>Associar ao perfil</Label>
                  <select id={`person-${person.user_id}`} value={selected[person.user_id] || ""} onChange={e=>setSelected(v=>({...v,[person.user_id]:e.target.value as Person | ""}))} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="">Selecione a viajante</option>
                    {people.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <Button type="button" disabled={!person.email_verified || !selected[person.user_id] || busy === person.user_id} onClick={()=>void approve(person)} className="min-h-11 rounded-full">
                  <UserCheck className="mr-2 h-4 w-4" />{busy === person.user_id ? "Vinculando…" : "Aprovar vínculo"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      }
    </section>
  );
}
