import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { neonAuthClient, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, LockKeyhole, Mail } from "lucide-react";

type Mode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const recovery = new URLSearchParams(window.location.search).get("reset") === "1";
  const [mode, setMode] = useState<Mode>(recovery ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && mode !== "reset") navigate("/", { replace: true });
  }, [user, loading, navigate, mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error") || params.get("oauth_error");
    if (!oauthError || user || loading) return;

    toast.error("O Google não concluiu o acesso.", {
      description: "Tente novamente. Seu acesso e seus dados continuam seguros.",
    });
    window.history.replaceState({}, "", "/auth");
  }, [user, loading]);

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      if (neonAuthClient) {
        const result: any = await neonAuthClient.signIn.social({
          provider: "google",
          callbackURL: `${window.location.origin}/`,
          errorCallbackURL: `${window.location.origin}/auth?oauth_error=1`,
        });
        if (result?.error) throw result.error;
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível entrar com Google agora.");
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
        if (password !== confirm) throw new Error("As senhas não conferem.");

        const inviteRes = await fetch("/api/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessKey: accessKey.trim() }),
        });
        const invite = await inviteRes.json().catch(() => ({}));
        if (!inviteRes.ok) throw new Error(invite?.error || "Não foi possível validar a chave da viagem.");

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name.trim(), name: name.trim() },
          },
        });
        if (error) throw error;
        toast.success("Primeiro acesso criado", {
          description: "Se o e-mail de confirmação estiver ativo, confirme a mensagem antes de entrar.",
        });
        setMode("login");
        setPassword("");
        setConfirm("");
        setAccessKey("");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth?reset=1`,
        });
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
    } finally {
      setBusy(false);
    }
  };

  const isEntry = mode === "login" || mode === "signup";
  const title = mode === "signup" ? "Primeiro acesso" : mode === "forgot" ? "Recuperar senha" : mode === "reset" ? "Criar nova senha" : "Entrar na viagem";
  const subtitle = mode === "signup"
    ? "Use a chave da viagem uma única vez e crie sua senha pessoal."
    : mode === "forgot"
      ? "Enviaremos um link seguro para o seu e-mail."
      : mode === "reset"
        ? "Escolha uma nova senha para continuar."
        : "Vanessa, Camila e Danielle · nosso planejamento privado.";

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-olive mb-3 px-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="rounded-[1.75rem] sm:rounded-[2rem] border border-gold/30 bg-card/95 shadow-soft p-5 sm:p-8 backdrop-blur">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="h-12 w-12 rounded-2xl bg-gold/15 grid place-items-center shrink-0">
              <LockKeyhole className="h-5 w-5 text-olive" />
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.28em] uppercase text-olive">Europa 2028</p>
              <p className="text-xs text-muted-foreground mt-1">março · abril</p>
            </div>
          </div>

          {isEntry && (
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary/70 p-1 mb-6" role="tablist" aria-label="Tipo de acesso">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${mode === "login" ? "bg-card text-ink shadow-sm" : "text-muted-foreground"}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${mode === "signup" ? "bg-card text-ink shadow-sm" : "text-muted-foreground"}`}
              >
                Primeiro acesso
              </button>
            </div>
          )}

          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>

          {mode === "login" && (
            <div className="mt-7">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void signInWithGoogle()}
                className="w-full h-12 rounded-full border-border bg-background text-base font-medium shadow-sm"
              >
                <span className="mr-2 grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-ink shadow-sm">G</span>
                Continuar com Google
              </Button>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">ou</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          )}

          <form onSubmit={submit} className={`space-y-4 ${mode === "login" ? "" : "mt-7"}`}>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" className="h-12 text-base rounded-xl" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Vanessa, Camila ou Danielle" />
              </div>
            )}

            {mode !== "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" className="h-12 text-base rounded-xl" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="accessKey">Chave da viagem</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive" />
                  <Input id="accessKey" className="h-12 text-base rounded-xl pl-10" type="password" autoComplete="off" required value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Chave compartilhada" />
                </div>
                <p className="text-xs text-muted-foreground">Você usa essa chave só para criar seu acesso. Depois, entra com seu e-mail e sua própria senha.</p>
              </div>
            )}

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">{mode === "reset" ? "Nova senha" : "Sua senha"}</Label>
                <Input id="password" className="h-12 text-base rounded-xl" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}

            {(mode === "signup" || mode === "reset") && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input id="confirm" className="h-12 text-base rounded-xl" type="password" autoComplete="new-password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full h-12 rounded-full shadow-card text-base">
              {busy ? "Processando…" : mode === "signup" ? "Criar meu acesso" : mode === "forgot" ? "Enviar link" : mode === "reset" ? "Salvar nova senha" : "Entrar com e-mail"}
            </Button>
          </form>

          {mode === "login" && (
            <button type="button" onClick={() => setMode("forgot")} className="mt-4 min-h-11 w-full inline-flex justify-center items-center gap-2 text-sm text-olive hover:underline">
              <Mail className="h-4 w-4" /> Esqueci minha senha
            </button>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button type="button" onClick={() => setMode("login")} className="mt-4 min-h-11 w-full text-sm text-olive hover:underline">
              Voltar para entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
