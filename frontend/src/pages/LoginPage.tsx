import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const m = params.get("mode");
    if (m === "register") setMode("register");
    else setMode("login");
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-eagle-mist/40 bg-eagle-deep/70 p-8 shadow-xl">
      <h1 className="font-display text-2xl font-bold text-eagle-foam">
        {t("auth.title")}
      </h1>
      <div className="mt-4 flex gap-2 rounded-xl bg-eagle-night/80 p-1">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mode === "login"
              ? "bg-eagle-gold text-eagle-night"
              : "text-eagle-sand/80"
          }`}
          onClick={() => setMode("login")}
        >
          {t("auth.login")}
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
            mode === "register"
              ? "bg-eagle-gold text-eagle-night"
              : "text-eagle-sand/80"
          }`}
          onClick={() => setMode("register")}
        >
          {t("auth.register")}
        </button>
      </div>
      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {mode === "register" ? (
          <label className="block text-sm">
            <span className="text-eagle-sand/80">{t("auth.name")}</span>
            <input
              className="mt-1 w-full rounded-xl border border-eagle-mist/50 bg-eagle-night px-3 py-2 text-eagle-foam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="text-eagle-sand/80">{t("auth.email")}</span>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-eagle-mist/50 bg-eagle-night px-3 py-2 text-eagle-foam"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-eagle-sand/80">{t("auth.password")}</span>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-eagle-mist/50 bg-eagle-night px-3 py-2 text-eagle-foam"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <p className="text-xs text-eagle-sand/50">{t("auth.hint")}</p>
        <button
          type="submit"
          className="w-full rounded-2xl bg-eagle-gold py-3 text-sm font-bold text-eagle-night"
        >
          {mode === "login" ? t("auth.submitLogin") : t("auth.submitRegister")}
        </button>
      </form>
    </div>
  );
}
