import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Cloud,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useStore();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t("auth.emailRequired", "El correo electrónico es obligatorio"));
      return;
    }

    if (!password.trim()) {
      setError(t("auth.passwordRequired", "La contraseña es obligatoria"));
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("common.error", "Ocurrió un error")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-[620px] overflow-hidden bg-[#0a0f1a] lg:block">
        <img
          src="/images/hero/otavalo.svg"
          alt={t("auth.loginImageAlt", "Imagen de inicio de sesión")}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,26,0.92),rgba(10,15,26,0.25)_48%,rgba(247,183,51,0.2))]" />

        <div className="absolute left-8 top-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl">
          <Cloud size={15} className="text-primary" />
          Amazon Cognito · us-east-1
        </div>

        <div className="absolute inset-x-8 bottom-8 rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-md">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[#0a0f1a] shadow-lg shadow-black/20">
            <ShieldCheck size={24} />
          </div>

          <h2 className="font-display text-4xl font-bold leading-tight">
            {t("auth.loginWelcomeTitle", "Bienvenido de nuevo")}
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
            {t(
              "auth.loginWelcomeSubtitle",
              "Accede a tu cuenta para continuar comprando de forma rápida, segura y personalizada."
            )}
          </p>
        </div>
      </div>

      <div className="flex min-h-[620px] items-center bg-[radial-gradient(circle_at_top_right,rgba(247,183,51,0.12),transparent_36%),linear-gradient(180deg,#fff,#fbfaf7)] p-6 sm:p-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {t("auth.productionConnected")}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
              {t("auth.login", "Iniciar sesión")}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.loginSubtitle", "¿No tienes una cuenta?")}

              <Link
                to="/register"
                className="ml-1 font-semibold text-accent transition-colors hover:text-secondary"
              >
                {t("auth.register", "Crear cuenta")}
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.email", "Correo")}</span>

              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <Mail size={18} className="shrink-0 text-muted-foreground" />

                <input
                  type="email"
                  className="w-full bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                  placeholder={t(
                    "auth.emailPlaceholder",
                    "ejemplo@correo.com"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </span>
            </label>

            <div>
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.password", "Contraseña")}</span>

                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-muted-foreground"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                    placeholder={t(
                      "auth.passwordPlaceholder",
                      "Ingresa tu contraseña"
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="shrink-0 rounded-xl p-1 text-muted-foreground transition hover:bg-black/5 hover:text-foreground"
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword", "Ocultar contraseña")
                        : t("auth.showPassword", "Mostrar contraseña")
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              <div className="mt-3 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="group inline-flex items-center gap-1 text-sm font-bold text-accent transition-colors hover:text-secondary"
                >
                  {t("auth.forgotPassword", "¿Olvidaste tu contraseña?")}

                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold text-foreground">
                    {t("auth.secureLoginTitle", "Acceso seguro")}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t(
                      "auth.secureLoginDescription",
                      "Usa la contraseña que registraste. Debe contener letras, números y caracteres especiales para mayor seguridad."
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                [BadgeCheck, t("auth.identityBadge")],
                [UsersRound, t("auth.rolesBadge")],
                [ShieldCheck, t("auth.sessionBadge")],
              ].map(([Icon, label]) => {
                const SecurityIcon = Icon as typeof BadgeCheck;
                return (
                  <div key={String(label)} className="rounded-2xl border border-black/10 bg-white/80 px-2 py-3 text-center shadow-sm backdrop-blur">
                    <SecurityIcon size={18} className="mx-auto text-accent" />
                    <p className="mt-2 text-[11px] font-black leading-4 text-neutral-700">{String(label)}</p>
                  </div>
                );
              })}
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-white shadow-lg shadow-accent/25 transition disabled:opacity-50 hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-secondary hover:not-disabled:shadow-secondary/25"
            >
              {loading
                ? t("common.loading", "Cargando...")
                : t("auth.submitLogin", "Iniciar sesión")}

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
