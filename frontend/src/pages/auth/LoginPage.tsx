import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-[620px] overflow-hidden bg-[#0a0f1a] lg:block">
        <img
          src="/images/hero/otavalo.svg"
          alt="Eagle Store"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,26,0.92),rgba(10,15,26,0.25)_48%,rgba(247,183,51,0.2))]" />
        <div className="absolute inset-x-8 bottom-8 rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-md">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[#0a0f1a] shadow-lg shadow-black/20">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Eagle Store
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
            {t("home.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex min-h-[620px] items-center bg-background p-6 sm:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="mb-3 inline-flex rounded-full bg-primary/20 px-4 py-2 text-xs font-bold text-foreground">
              Eagle Store
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
              {t("auth.login")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.loginSubtitle")}
              <a href="/register" className="ml-1 font-semibold text-accent hover:text-secondary transition-colors">
                {t("auth.register")}
              </a>
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.email")}</span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <Mail
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
                <input
                  type="email"
                  className="w-full bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.password")}</span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
                <input
                  type="password"
                  className="w-full bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </span>
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}

            <a href="/forgot-password" className="block text-sm font-semibold text-accent hover:text-secondary transition-colors">
              {t("auth.forgotPassword")}
            </a>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-white shadow-lg shadow-accent/25 transition disabled:opacity-50 hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-secondary hover:not-disabled:shadow-secondary/25"
            >
              {loading ? t("common.loading") : t("auth.submitLogin")}
              {!loading && (
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
