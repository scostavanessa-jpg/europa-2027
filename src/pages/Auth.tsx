import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, neonAuthClient, isNeonConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";

type Mode = "login" | "signup" | "forgot" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const resetQuery = new URLSearchParams(window.location.search);
  const recovery = resetQuery.get("reset") === "1" || resetQuery.has("token");
  const [mode, setMode] = useState<Mode>(recovery ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && mode !== "reset") navigate("/", { replace: true });
  }, [user, loading, navigate, mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error") || params.get("oauth_error");
    if (!oauthError || user || loading) return;

    toast.info("O acesso usa sua senha pessoal.", {
      description: "Se você já entrou antes, use ‘Esqueci minha senha’ para recuperar o acesso.",
    });
    window.history.replaceState({}, "", "/auth");
  }, [user, loading]);

  const signInGoogle = async () => {
    setGoogleBusy(true);
    setInlineError("");
    try {
      // All login methods must share the same auth client and session store.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/grupo` },
      });
      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
    } catch (e: any) {
      const message = e?.message || "Confira sua conexão e tente novamente.";
      setInlineError("O acesso pelo Google falhou: " + message);
      toast.error("Não foi possível entrar com Google.", { description: message });
    } finally {
      setGoogleBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setInlineError("");
    try {
      if (mode === "signup") {
        if (!name) throw new Error("Escolha seu nome.");
        if (password.length < 8) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
        if (password !== confirm) throw new Error("As senhas não conferem.");

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name, name },
          },
        });
        if (error) throw error;

        toast.success("Cadastro registrado", {
          description: "Confira a confirmação de e-mail. O vínculo com Camila ou Danielle será aprovado pela organizadora antes de liberar a viagem.",
        });
        setMode("login");
        setPassword("");
        setConfirm("");
      } else if (mode === "forgot") {
        if (isNeonConfigured && neonAuthClient) {
          const { error } = await neonAuthClient.requestPasswordReset({
            email: email.trim(),
            redirectTo: `${window.location.origin}/auth?reset=1`,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth?reset=1`,
          });
          if (error) throw error;
        }
        toast.success("Link enviado", { description: "Confira seu e-mail para criar uma nova senha." });
        setMode("login");
      } else if (mode === "reset") {
        if (password.length < 8) throw new Error("Escolha uma senha com pelo menos 8 caracteres.");
        if (password !== confirm) throw new Error("As senhas não conferem.");
        if (isNeonConfigured && neonAuthClient) {
          const token = new URLSearchParams(window.location.search).get("token");
          if (!token) throw new Error("O link de recuperação está incompleto. Solicite outro pelo botão ‘Esqueci minha senha’.");
          const { error } = await neonAuthClient.resetPassword({ newPassword: password, token });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;
        }
        toast.success("Senha atualizada. Entre com sua nova senha.");
        setPassword("");
        setConfirm("");
        setMode("login");
        navigate("/auth", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        // Wait for the actual shared auth client to recognise the new session.
        // A React-router navigation can race the auth context and bounce back to /auth.
        const { data: verified, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!verified?.session?.user && !data?.session?.user) {
          throw new Error("Sua senha foi aceita, mas o navegador não manteve a sessão. Verifique os cookies ou use a opção Google.");
        }
        // Verified in a real mobile-browser QA run: the cookie survives a full page load.
        window.location.replace("/grupo");
      }
    } catch (err: any) {
      const msg = err?.message || "Não foi possível concluir agora.";
      setInlineError(msg.includes("Invalid login") ? "E-mail ou senha inválidos." : msg);
      const resetError = mode === "reset" && /token|expired|invalid.*link|expiration/i.test(msg);
      if (resetError) {
        toast.error("Link vencido ou inválido.", { description: "Use ‘Esqueci minha senha’ para receber um novo link." });
        setMode("forgot");
        return;
      }
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
        toast.error("Esse e-mail já tem uma conta.", {
          description: "Use ‘Esqueci minha senha’ para recuperar sua senha pessoal.",
        });
      } else {
        toast.error(msg.includes("Invalid login") ? "E-mail ou senha inválidos." : msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const isEntry = mode === "login" || mode === "signup";
  const title = mode === "signup" ? "Primeiro acesso" : mode === "forgot" ? "Recuperar senha" : mode === "reset" ? "Criar nova senha" : "Entrar na viagem";
  const subtitle = mode === "signup"
    ? "Escolha seu nome e crie sua senha pessoal. Depois confirme o e-mail; a organizadora autoriza seu perfil."
    : mode === "forgot"
      ? "Enviaremos um link seguro para o seu e-mail."
      : mode === "reset"
        ? "Escolha uma senha pessoal de 8 caracteres ou mais. Sem necessidade de símbolos."
        : "Vanessa, Camila e Danielle · nosso planejamento privado. Entre com Google ou com sua senha pessoal.";

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
              <button type="button" onClick={() => setMode("login")} className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${mode === "login" ? "bg-card text-ink shadow-sm" : "text-muted-foreground"}`}>
                Entrar
              </button>
              <button type="button" onClick={() => setMode("signup")} className={`min-h-11 rounded-xl text-sm font-medium transition-colors ${mode === "signup" ? "bg-card text-ink shadow-sm" : "text-muted-foreground"}`}>
                Primeiro acesso
              </button>
            </div>
          )}

          <h1 className="font-display text-4xl sm:text-5xl text-ink leading-none">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>

          {mode === "login" && (
            <div className="mt-5">
              <Button type="button" variant="outline" disabled={googleBusy || busy} onClick={() => void signInGoogle()} className="w-full min-h-12 rounded-full bg-card text-ink font-medium border-olive/40">
                {googleBusy ? "Abrindo o Google…" : "Entrar com Google (sem senha)"}
              </Button>
              <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/><span>ou use sua senha pessoal</span><span className="h-px flex-1 bg-border"/></div>
              <p className="text-xs text-muted-foreground leading-relaxed">Use a mesma conta Google que já está vinculada ao seu perfil. Não é necessário fazer outro cadastro.</p>
            </div>
          )}

          {inlineError && <div role="alert" aria-live="polite" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{inlineError}</div>}

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Quem é você?</Label>
                <select id="name" className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base" required value={name} onChange={(e) => setName(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="Vanessa">Vanessa</option>
                  <option value="Camila">Camila</option>
                  <option value="Danielle">Danielle</option>
                </select>
              </div>
            )}

            {mode !== "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" className="h-12 text-base rounded-xl" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
              </div>
            )}

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">{mode === "reset" ? "Nova senha" : "Sua senha"}</Label>
                <Input id="password" className="h-12 text-base rounded-xl" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? undefined : 8} required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}

            {(mode === "signup" || mode === "reset") && (
              <p className="text-xs text-muted-foreground">Basta ter 8 caracteres ou mais. Você não precisa de uma chave compartilhada.</p>
            )}

            {(mode === "signup" || mode === "reset") && (
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input id="confirm" className="h-12 text-base rounded-xl" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full h-12 rounded-full shadow-card text-base">
              {busy ? "Processando…" : mode === "signup" ? "Criar meu acesso" : mode === "forgot" ? "Enviar link" : mode === "reset" ? "Salvar nova senha" : "Entrar"}
            </Button>
          </form>

          {mode === "login" && (
            <button type="button" onClick={() => setMode("forgot")} className="mt-4 min-h-11 w-full inline-flex justify-center items-center gap-2 text-sm text-olive hover:underline">
              <Mail className="h-4 w-4" /> Esqueci minha senha
            </button>
          )}
          {mode === "login" && (
            <Link to="/diagnostico" className="mt-2 min-h-10 w-full inline-flex items-center justify-center text-xs font-medium underline underline-offset-4 text-muted-foreground hover:text-olive">
              Não consigo entrar · Diagnosticar meu acesso
            </Link>
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
