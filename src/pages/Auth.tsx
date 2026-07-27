import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, LockKeyhole } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const recovery = new URLSearchParams(window.location.search).get("reset") === "1";
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(recovery ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && mode !== "reset") navigate("/", { replace: true });
  }, [user, loading, navigate, mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name.trim(), name: name.trim() } },
        });
        if (error) throw error;
        toast.success("Conta criada", { description: "Se a confirmação por e-mail estiver ativa, confirme antes do primeiro acesso." });
        setMode("login");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth?reset=1` });
        if (error) throw error;
        toast.success("Link enviado", { description: "Confira seu e-mail para criar uma nova senha." });
        setMode("login");
      } else if (mode === "reset") {
        if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
        if (password !== confirm) throw new Error("As senhas não conferem.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Senha atualizada");
        navigate("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || "Não foi possível concluir agora.";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha inválidos." : msg);
    } finally { setBusy(false); }
  };

  const title = mode === "signup" ? "Criar sua conta" : mode === "forgot" ? "Recuperar senha" : mode === "reset" ? "Nova senha" : "Entrar na viagem";
  const subtitle = mode === "signup" ? "Uma conta para cada viajante." : mode === "forgot" ? "Enviaremos um link seguro para seu e-mail." : mode === "reset" ? "Escolha sua nova senha." : "Vanessa, Camila e Danielle — planejamento privado do grupo.";

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-olive mb-5"><ArrowLeft className="h-4 w-4" /> Voltar à viagem</Link>
        <div className="rounded-[2rem] border border-gold/30 bg-card/95 shadow-soft p-7 md:p-9 backdrop-blur">
          <div className="h-11 w-11 rounded-2xl bg-gold/15 grid place-items-center mb-5"><LockKeyhole className="h-5 w-5 text-olive" /></div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-olive mb-2">Europa até Liverpool 2027</p>
          <h1 className="font-display text-4xl text-ink">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>

          <form onSubmit={submit} className="space-y-4 mt-7">
            {mode === "signup" && <div className="space-y-1.5"><Label htmlFor="name">Nome</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" /></div>}
            {mode !== "reset" && <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></div>}
            {mode !== "forgot" && <div className="space-y-1.5"><Label htmlFor="password">{mode === "reset" ? "Nova senha" : "Senha"}</Label><Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
            {mode === "reset" && <div className="space-y-1.5"><Label htmlFor="confirm">Confirmar nova senha</Label><Input id="confirm" type="password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>}
            <Button type="submit" disabled={busy} className="w-full h-12 rounded-full shadow-card">{busy ? "Processando…" : mode === "signup" ? "Criar conta" : mode === "forgot" ? "Enviar link" : mode === "reset" ? "Salvar nova senha" : "Entrar"}</Button>
          </form>

          {mode === "login" && <button type="button" onClick={() => setMode("forgot")} className="mt-4 w-full inline-flex justify-center items-center gap-2 text-sm text-olive hover:underline"><Mail className="h-4 w-4" /> Esqueci minha senha</button>}
          {mode !== "reset" && <div className="mt-6 pt-5 border-t border-border/60 text-center"><button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-sm text-ink hover:text-olive">{mode === "signup" ? "Já tenho conta" : "Ainda não tenho conta"}</button></div>}
        </div>
      </div>
    </div>
  );
};

export default Auth;