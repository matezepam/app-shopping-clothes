import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Globe2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import heroImage from "../assets/hero.png";
import type { Gender } from "../types/store";

const countries = [
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "593" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "1" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "57" },
  { code: "PE", name: "Peru", flag: "🇵🇪", dialCode: "51" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dialCode: "52" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dialCode: "34" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "54" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "56" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "55" },
] as const;

export function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [params] = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+593 ");
  const [countryCode, setCountryCode] = useState("EC");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const m = params.get("mode");
    if (m === "register") setMode("register");
    else setMode("login");
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const country = countries.find((c) => c.code === countryCode) ?? countries[0];
    try {
      if (mode === "login") await login(email, password);
      else {
        if (password !== confirmPassword) {
          setError(t("auth.passwordMismatch"));
          return;
        }
        await register({
          firstName,
          lastName,
          email,
          password,
          phone,
          country: country.name,
          countryCode: country.code,
          countryFlag: country.flag,
          age: Number(age),
          gender,
        });
      }
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-[620px] overflow-hidden bg-[#0a0f1a] lg:block">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,26,0.92),rgba(10,15,26,0.25)_48%,rgba(247,183,51,0.2))]" />
        <div className="absolute inset-x-8 bottom-8 rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-md">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[#0a0f1a] shadow-lg shadow-black/20">
            <ShieldCheck size={24} aria-hidden />
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
              {t("auth.title")}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
            <button
              type="button"
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-[#0a0f1a] text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMode("login")}
            >
              {t("auth.login")}
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-[#0a0f1a] text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setMode("register")}
            >
              {t("auth.register")}
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            {mode === "register" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-foreground">
                  <span>{t("auth.firstName")}</span>
                  <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                    <UserRound
                      size={18}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                      placeholder={t("auth.firstName")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </span>
                </label>
                <label className="block text-sm font-semibold text-foreground">
                  <span>{t("auth.lastName")}</span>
                  <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                    <UserRound
                      size={18}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                      placeholder={t("auth.lastName")}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </span>
                </label>
              </div>
            ) : null}
            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.email")}</span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <Mail
                  size={18}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden
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
            {mode === "register" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-foreground">
                    <span>{t("auth.phone")}</span>
                    <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                      <Phone
                        size={18}
                        className="shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        type="tel"
                        className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                        placeholder={t("auth.phone")}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </span>
                  </label>
                  <label className="block text-sm font-semibold text-foreground">
                    <span>{t("auth.age")}</span>
                    <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                      <CalendarDays
                        size={18}
                        className="shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        type="number"
                        min={13}
                        max={99}
                        inputMode="numeric"
                        className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                        placeholder={t("auth.age")}
                        value={age}
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          setAge(onlyNumbers.slice(0, 2));
                        }}
                        required
                      />
                    </span>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-foreground">
                    <span>{t("auth.country")}</span>
                    <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                      <Globe2
                        size={18}
                        className="shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <select
                        className="w-full min-w-0 bg-transparent font-bold text-muted-foreground outline-none"
                        value={countryCode}
                        onChange={(e) => {
                          const nextCode = e.target.value;
                          const nextCountry =
                            countries.find((country) => country.code === nextCode) ??
                            countries[0];
                          setCountryCode(nextCode);
                          setPhone(`+${nextCountry.dialCode} `);
                        }}
                        required
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label className="block text-sm font-semibold text-foreground">
                    <span>{t("auth.gender")}</span>
                    <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                      <UsersRound
                        size={18}
                        className="shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <select
                        className="w-full min-w-0 bg-transparent font-bold text-muted-foreground outline-none"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        required
                      >
                        <option value="female">{t("auth.genderFemale")}</option>
                        <option value="male">{t("auth.genderMale")}</option>
                        <option value="non_binary">
                          {t("auth.genderNonBinary")}
                        </option>
                        <option value="prefer_not_to_say">
                          {t("auth.genderPreferNot")}
                        </option>
                      </select>
                    </span>
                  </label>
                </div>
              </>
            ) : null}
            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.password")}</span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden
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
            {mode === "register" ? (
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.confirmPassword")}</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="password"
                    className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                    placeholder={t("auth.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </span>
              </label>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:bg-secondary hover:shadow-secondary/25"
            >
              {mode === "login"
                ? t("auth.submitLogin")
                : t("auth.submitRegister")}
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
