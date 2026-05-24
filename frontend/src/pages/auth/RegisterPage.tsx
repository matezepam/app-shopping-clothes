import { useState, type FormEvent } from "react";
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
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import type { Gender } from "../../types/store";

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

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useStore();
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+593 ");
  const [countryCode, setCountryCode] = useState("EC");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    if (Number(age) < 13) {
      setError(t("auth.ageTooYoung"));
      return;
    }

    setLoading(true);

    try {
      const country =
        countries.find((c) => c.code === countryCode) ?? countries[0];

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

      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  const handleCountryChange = (nextCode: string) => {
    const nextCountry = countries.find((c) => c.code === nextCode) ?? countries[0];
    setCountryCode(nextCode);
    setPhone(`+${nextCountry.dialCode} `);
  };

  const handleAgeChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    setAge(onlyNumbers.slice(0, 2));
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-2xl shadow-black/10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-[620px] overflow-hidden bg-[#0a0f1a] lg:block">
        <img
          src="/images/hero/galapagos.svg"
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

      <div className="flex min-h-[620px] items-center overflow-y-auto bg-background p-6 sm:p-10">
        <div className="mx-auto w-full max-w-md py-8">
          <div className="mb-8">
            <p className="mb-3 inline-flex rounded-full bg-primary/20 px-4 py-2 text-xs font-bold text-foreground">
              Eagle Store
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
              {t("auth.register")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ¡Únete a nuestra comunidad!
              <a href="/login" className="ml-1 font-semibold text-accent hover:text-secondary transition-colors">
                {t("auth.login")}
              </a>
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.firstName")}</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <UserRound
                    size={18}
                    className="shrink-0 text-muted-foreground"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.phone")}</span>
                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <Phone
                    size={18}
                    className="shrink-0 text-muted-foreground"
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
                  />
                  <input
                    type="number"
                    min={13}
                    max={99}
                    inputMode="numeric"
                    className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                    placeholder={t("auth.age")}
                    value={age}
                    onChange={(e) => handleAgeChange(e.target.value)}
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
                  />
                  <select
                    className="w-full min-w-0 bg-transparent font-bold text-muted-foreground outline-none"
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
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
                  />
                  <select
                    className="w-full min-w-0 bg-transparent font-bold text-muted-foreground outline-none"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    required
                  >
                    <option value="female">{t("auth.genderFemale")}</option>
                    <option value="male">{t("auth.genderMale")}</option>
                    <option value="non_binary">{t("auth.genderNonBinary")}</option>
                    <option value="prefer_not_to_say">
                      {t("auth.genderPreferNot")}
                    </option>
                  </select>
                </span>
              </label>
            </div>

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

            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.confirmPassword")}</span>
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-muted-foreground"
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
              {loading ? t("common.loading") : t("auth.submitRegister")}
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
