import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

type RecoveryMethod = "email" | "phone";

export function ForgotPasswordPage() {
  const [method, setMethod] = useState<RecoveryMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const currentValue = method === "email" ? email : phone;

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhone = (value: string) => {
    return /^[0-9+\s()-]{7,20}$/.test(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (method === "email") {
      if (!email.trim()) {
        setError("Ingresa tu correo electrónico.");
        return;
      }

      if (!validateEmail(email)) {
        setError("Ingresa un correo electrónico válido.");
        return;
      }
    }

    if (method === "phone") {
      if (!phone.trim()) {
        setError("Ingresa tu número de teléfono.");
        return;
      }

      if (!validatePhone(phone)) {
        setError("Ingresa un número de teléfono válido.");
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1600);
  };

  const resetForm = () => {
    setIsSent(false);
    setEmail("");
    setPhone("");
    setError("");
    setMethod("email");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-120px] h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[660px] overflow-hidden bg-[#0a0f1a] lg:block">
            <img
              src="/images/hero/otavalo.svg"
              alt="Recuperar contraseña"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />

            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,26,0.96),rgba(10,15,26,0.48)_45%,rgba(247,183,51,0.2))]" />

            <div className="absolute left-8 top-8">
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-white/15"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[#0a0f1a]">
                  S
                </span>
                Sprint Store
              </Link>
            </div>

            <div className="absolute inset-x-8 bottom-8 rounded-3xl border border-white/15 bg-white/10 p-7 text-white shadow-2xl shadow-black/20 backdrop-blur-md">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-[#0a0f1a] shadow-lg shadow-black/20">
                <ShieldCheck size={26} />
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight">
                Recupera tu acceso de forma segura
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
                Elige si deseas recibir las instrucciones por correo electrónico
                o por teléfono. El proceso es rápido, seguro y fácil de usar.
              </p>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xl font-bold">24/7</p>
                  <p className="mt-1 text-xs text-white/65">Disponible</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xl font-bold">2 min</p>
                  <p className="mt-1 text-xs text-white/65">Rápido</p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xl font-bold">Seguro</p>
                  <p className="mt-1 text-xs text-white/65">Protegido</p>
                </div>
              </div>
            </div>

            <div className="absolute right-12 top-32 hidden h-48 w-48 animate-bounce rounded-[2rem] border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md xl:block [animation-duration:4s]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0a0f1a]">
                <LockKeyhole size={24} />
              </div>

              <p className="text-sm font-bold">Código temporal</p>

              <p className="mt-2 text-xs leading-5 text-white/65">
                Por seguridad, el enlace o código de recuperación tendrá tiempo
                limitado.
              </p>
            </div>
          </div>

          <div className="flex min-h-[660px] items-center bg-background p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-foreground shadow-sm transition hover:bg-black/[0.03]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[#0a0f1a]">
                    S
                  </span>
                  Sprint Store
                </Link>
              </div>

              {!isSent ? (
                <>
                  <div className="mb-8 animate-[fadeIn_.7s_ease-in-out]">
                    <Link
                      to="/login"
                      className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-accent"
                    >
                      <ArrowLeft size={17} />
                      Volver al login
                    </Link>

                    <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/20 text-foreground ring-1 ring-primary/30">
                      {method === "email" ? (
                        <Mail size={30} />
                      ) : (
                        <Phone size={30} />
                      )}
                    </div>

                    <h2 className="font-display text-4xl font-bold leading-tight text-foreground">
                      ¿Olvidaste tu contraseña?
                    </h2>

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      Selecciona cómo quieres recuperar tu cuenta. Te enviaremos
                      las instrucciones para restablecer tu contraseña.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="animate-[slideUp_.7s_ease-in-out] space-y-5"
                  >
                    <div>
                      <p className="mb-3 text-sm font-semibold text-foreground">
                        Método de recuperación
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setMethod("email");
                            setError("");
                          }}
                          className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
                            method === "email"
                              ? "border-secondary bg-secondary/10 ring-4 ring-secondary/10"
                              : "border-black/10 bg-white hover:bg-black/[0.03]"
                          }`}
                        >
                          <span
                            className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                              method === "email"
                                ? "bg-secondary text-white"
                                : "bg-primary/20 text-foreground"
                            }`}
                          >
                            <Mail size={20} />
                          </span>

                          <span className="block text-sm font-bold text-foreground">
                            Email
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            Recibir enlace seguro
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMethod("phone");
                            setError("");
                          }}
                          className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
                            method === "phone"
                              ? "border-secondary bg-secondary/10 ring-4 ring-secondary/10"
                              : "border-black/10 bg-white hover:bg-black/[0.03]"
                          }`}
                        >
                          <span
                            className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                              method === "phone"
                                ? "bg-secondary text-white"
                                : "bg-primary/20 text-foreground"
                            }`}
                          >
                            <Phone size={20} />
                          </span>

                          <span className="block text-sm font-bold text-foreground">
                            Teléfono
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            Recibir código SMS
                          </span>
                        </button>
                      </div>
                    </div>

                    {method === "email" ? (
                      <label className="block text-sm font-semibold text-foreground">
                        <span>Correo electrónico</span>

                        <span className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
                            <Mail size={18} />
                          </span>

                          <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="h-full w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                          />
                        </span>
                      </label>
                    ) : (
                      <label className="block text-sm font-semibold text-foreground">
                        <span>Número de teléfono</span>

                        <span className="mt-2 flex h-14 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
                            <Phone size={18} />
                          </span>

                          <input
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="+593 99 999 9999"
                            className="h-full w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                          />
                        </span>
                      </label>
                    )}

                    {error ? (
                      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {error}
                      </p>
                    ) : null}

                    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
                          <ShieldCheck size={17} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-foreground">
                            Recuperación segura
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {method === "email"
                              ? "Te enviaremos un enlace seguro a tu correo electrónico. Si no lo encuentras, revisa spam o promociones."
                              : "Te enviaremos un código de verificación por SMS. No compartas este código con nadie."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-white shadow-lg shadow-accent/25 transition disabled:cursor-not-allowed disabled:opacity-60 hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-secondary hover:not-disabled:shadow-secondary/25"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {method === "email"
                            ? "Enviando enlace..."
                            : "Enviando código..."}
                        </>
                      ) : (
                        <>
                          {method === "email"
                            ? "Enviar enlace de recuperación"
                            : "Enviar código por SMS"}

                          <ArrowRight
                            size={18}
                            className="transition group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      ¿Recordaste tu contraseña?{" "}
                      <Link
                        to="/login"
                        className="font-bold text-accent transition hover:text-secondary"
                      >
                        Iniciar sesión
                      </Link>
                    </p>
                  </form>
                </>
              ) : (
                <div className="animate-[slideUp_.7s_ease-in-out] rounded-[2rem] border border-black/10 bg-white p-7 shadow-xl shadow-black/5">
                  <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={34} />
                  </div>

                  <h2 className="font-display text-3xl font-bold text-foreground">
                    {method === "email"
                      ? "Revisa tu correo"
                      : "Revisa tu teléfono"}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {method === "email"
                      ? "Hemos enviado un enlace de recuperación a:"
                      : "Hemos enviado un código de recuperación a:"}
                  </p>

                  <p className="mt-4 rounded-2xl border border-black/10 bg-background px-4 py-3 text-sm font-bold text-foreground">
                    {currentValue}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {method === "email"
                      ? "Si no encuentras el correo, revisa tu carpeta de spam o promociones. El enlace puede expirar por seguridad."
                      : "Si no recibes el SMS, verifica que el número sea correcto. El código puede expirar por seguridad."}
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-foreground shadow-sm transition hover:bg-black/[0.03]"
                    >
                      Intentar de nuevo
                    </button>

                    <Link
                      to="/login"
                      className="rounded-2xl bg-accent px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:bg-secondary"
                    >
                      Volver al login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </main>
  );
}