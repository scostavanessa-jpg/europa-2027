import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, isNeonConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CheckCircle2, CircleHelp, Clipboard, Loader2, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CheckItem = { label: string; ok: boolean | null; detail: string };
function redact(message: string): string {
  return message
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[e-mail oculto]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, "[id oculto]")
    .slice(0, 220);
}
export default function Diagnostico() {
  const { user, isTripMember, isOrganizadora, participant, authError, loading, refreshProfile } = useAuth();
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState("");

  const diagnose = async () => {
    if (busy) return;
    setBusy(true);
    const next: CheckItem[] = [];
    next.push({label:"Configuração do site", ok:isNeonConfigured,detail:isNeonConfigured?"Conexão Neon configurada":"Faltam variáveis do backend"});
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const liveUser = data?.session?.user;
      next.push({label:"Sessão de login",ok:!!liveUser,detail:liveUser?"Sessão reconhecida pelo site":"Nenhuma sessão ativa neste navegador"});
      if (liveUser?.id) {
        const [profileRes,memberRes,roleRes] = await Promise.all([
          supabase.from("profiles").select("id").eq("id",liveUser.id).maybeSingle(),
          supabase.from("participants").select("name").eq("user_id",liveUser.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id",liveUser.id),
        ]);
        const queryError = profileRes.error||memberRes.error||roleRes.error;
        next.push({label:"Banco de dados",ok:!queryError,detail:queryError?redact(queryError.message):"Consultas concluídas"});
        next.push({label:"Perfil da viajante",ok:queryError?null:!!memberRes.data,detail:queryError?"Aguardando conexão":memberRes.data?"Perfil associado": "Aguardando aprovação da organizadora"});
        const hasRole = (roleRes.data||[]).some((r:{role:string})=>r.role==="organizadora");
        next.push({label:"Papel de organizadora",ok:queryError?null:hasRole,detail:queryError?"Aguardando conexão":hasRole?"Permissão encontrada":"Conta sem papel de organizadora"});
      }
    } catch(e:any) {
      next.push({label:"Servidor de login",ok:false,detail:redact(e?.message||"Erro inesperado")});
    }
    setChecks(next);
    setUpdated(new Date().toLocaleString("pt-BR"));
    setBusy(false);
  };
  useEffect(()=>{void diagnose();},[]);

  const report=()=>{
    const lines=[
      "Europa 2028 — diagnóstico de acesso",
      "Data: "+updated,
      "Configuração: "+(isNeonConfigured?"Neon":"Não confirmada"),
      "Login presente no contexto: "+(user?"sim":"não"),
      "Perfil vinculado no contexto: "+(participant?"sim":"não"),
      "Organizadora no contexto: "+(isOrganizadora?"sim":"não"),
      "Membro da viagem no contexto: "+(isTripMember?"sim":"não"),
      "Erro de contexto: "+(authError?redact(authError):"nenhum"),
      ...checks.map(x=>x.label+": "+(x.ok===null?"não verificado":x.ok?"OK":"ATENÇÃO")+" — "+x.detail),
    ];
    navigator.clipboard.writeText(lines.join("\n"))
      .then(()=>toast.success("Relatório copiado, sem senha, e-mail ou tokens."))
      .catch(()=>toast.error("Seu navegador não permitiu copiar."));
  };

  return <div className="min-h-screen bg-[#f8f6f1] text-[#2e352a] px-5 py-8 sm:py-14">
    <main className="mx-auto max-w-xl">
      <Link to="/auth" className="min-h-11 inline-flex items-center gap-2 text-sm text-olive"><ArrowLeft className="w-4 h-4"/>Voltar ao login</Link>
      <p className="mt-8 uppercase tracking-[.24em] text-olive text-xs">Europa 2028 · Ajuda com o acesso</p>
      <h1 className="font-display text-4xl sm:text-5xl leading-tight mt-3">Vamos descobrir<br/><em className="text-olive font-light">onde está o erro.</em></h1>
      <p className="mt-4 text-sm text-[#71796b] leading-relaxed">Esta página testa o estado do seu acesso sem pedir senha ou mostrar seus dados pessoais. Se algo falhar, copie o relatório e envie no nosso chat.</p>
      <section className="mt-7 rounded-3xl bg-white border border-[#e8e5db] p-5 sm:p-7 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Estado do acesso</h2>
          {busy||loading?<Loader2 className="w-5 h-5 text-olive animate-spin"/>:<ShieldCheck className="w-5 h-5 text-olive"/>}
        </div>
        <div className="mt-4 divide-y divide-[#eeeae1]">
          {checks.map((c,i)=><div key={i} className="py-4 flex gap-3 items-start">
            {c.ok===true?<CheckCircle2 className="w-5 h-5 text-[#527654] mt-0.5"/>:c.ok===false?<XCircle className="w-5 h-5 text-[#a46b58] mt-0.5"/>:<CircleHelp className="w-5 h-5 text-[#97896a] mt-0.5"/>}
            <div><p className="font-medium text-sm">{c.label}</p><p className="mt-1 text-xs text-[#7b8177]">{c.detail}</p></div>
          </div>)}
          {checks.length===0&&<p className="py-6 text-sm text-[#777e70]">Verificando…</p>}
        </div>
        {updated&&<p className="text-[11px] text-[#a2a69c] mt-2">Última verificação: {updated}</p>}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button variant="outline" disabled={busy} onClick={async()=>{await refreshProfile();await diagnose();}} className="min-h-12 rounded-full"><RefreshCcw className="w-4 h-4 mr-2"/>Reverificar</Button>
          <Button onClick={report} disabled={busy||checks.length===0} className="min-h-12 rounded-full"><Clipboard className="w-4 h-4 mr-2"/>Copiar relatório</Button>
        </div>
      </section>
      <div className="flex justify-center mt-6"><Link to="/auth" className="text-sm underline underline-offset-4 text-olive">Tentar entrar novamente</Link></div>
    </main>
  </div>;
}
