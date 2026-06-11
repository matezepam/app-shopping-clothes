import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
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

  const passwordRules = [
    {
      label: t("auth.passwordRuleLength", "Mínimo 8 caracteres"),
      valid: password.length >= 8,
    },
    {
      label: t("auth.passwordRuleUppercase", "Una letra mayúscula"),
      valid: /[A-Z]/.test(password),
    },
    {
      label: t("auth.passwordRuleLowercase", "Una letra minúscula"),
      valid: /[a-z]/.test(password),
    },
    {
      label: t("auth.passwordRuleNumber", "Un número"),
      valid: /[0-9]/.test(password),
    },
    {
      label: t("auth.passwordRuleSpecial", "Un carácter especial, por ejemplo @, #, $, %, &"),
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const validPasswordRules = passwordRules.filter((rule) => rule.valid).length;
  const isPasswordValid = passwordRules.every((rule) => rule.valid);

  const passwordStrength =
    password.length === 0
      ? {
          label: t("auth.passwordStrengthEmpty", "Sin contraseña"),
          textClass: "text-muted-foreground",
          barClass: "bg-muted",
          progressClass: "w-0 bg-muted",
        }
      : validPasswordRules <= 2
        ? {
            label: t("auth.passwordStrengthWeak", "Débil"),
            textClass: "text-red-600",
            barClass: "bg-red-100",
            progressClass: "w-1/3 bg-red-500",
          }
        : validPasswordRules <= 4
          ? {
              label: t("auth.passwordStrengthMedium", "Medianamente segura"),
              textClass: "text-yellow-600",
              barClass: "bg-yellow-100",
              progressClass: "w-2/3 bg-yellow-500",
            }
          : {
              label: t("auth.passwordStrengthStrong", "Muy segura"),
              textClass: "text-green-600",
              barClass: "bg-green-100",
              progressClass: "w-full bg-green-500",
            };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError(
        t(
          "auth.passwordRequirementsError",
          "La contraseña no cumple con todos los requisitos de seguridad"
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch", "Las contraseñas no coinciden"));
      return;
    }

    if (Number(age) < 13) {
      setError(t("auth.ageTooYoung", "Debes tener al menos 13 años"));
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
      setError(
        err instanceof Error
          ? err.message
          : t("common.error", "Ocurrió un error")
      );
    } finally {
      setLoading(false);
    }
  }

  const handleCountryChange = (nextCode: string) => {
    const nextCountry =
      countries.find((c) => c.code === nextCode) ?? countries[0];

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
          alt="Registro"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,15,26,0.92),rgba(10,15,26,0.25)_48%,rgba(247,183,51,0.2))]" />

        <div className="absolute inset-x-8 bottom-8 rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-md">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[#0a0f1a] shadow-lg shadow-black/20">
            <ShieldCheck size={24} />
          </div>

          <h2 className="font-display text-4xl font-bold leading-tight">
            {t("auth.joinTitle", "Crea tu cuenta")}
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
            {t(
              "auth.joinSubtitle",
              "Regístrate para comprar, guardar tus productos favoritos y disfrutar una experiencia segura."
            )}
          </p>
        </div>
      </div>

      <div className="flex min-h-[620px] items-center overflow-y-auto bg-background p-6 sm:p-10">
        <div className="mx-auto w-full max-w-md py-8">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
              {t("auth.register", "Crear cuenta")}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("auth.alreadyAccount", "¿Ya tienes una cuenta?")}
              <a
                href="/login"
                className="ml-1 font-semibold text-accent transition-colors hover:text-secondary"
              >
                {t("auth.login", "Iniciar sesión")}
              </a>
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.firstName", "Nombre")}</span>

                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <UserRound
                    size={18}
                    className="shrink-0 text-muted-foreground"
                  />

                  <input
                    className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                    placeholder={t(
                      "auth.firstNamePlaceholder",
                      "Ingresa tu nombre"
                    )}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.lastName", "Apellido")}</span>

                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <UserRound
                    size={18}
                    className="shrink-0 text-muted-foreground"
                  />

                  <input
                    className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                    placeholder={t(
                      "auth.lastNamePlaceholder",
                      "Ingresa tu apellido"
                    )}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </span>
              </label>
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.phone", "Teléfono")}</span>

                <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                  <Phone size={18} className="shrink-0 text-muted-foreground" />

                  <input
                    type="tel"
                    className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                    placeholder={t(
                      "auth.phonePlaceholder",
                      "+593 999 999 999"
                    )}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.age", "Edad")}</span>

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
                    placeholder={t("auth.agePlaceholder", "Tu edad")}
                    value={age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    required
                  />
                </span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-foreground">
                <span>{t("auth.country", "País")}</span>

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
                <span>{t("auth.gender", "Género")}</span>

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
                    <option value="female">
                      {t("auth.genderFemale", "Femenino")}
                    </option>

                    <option value="male">
                      {t("auth.genderMale", "Masculino")}
                    </option>

                    <option value="non_binary">
                      {t("auth.genderNonBinary", "No binario")}
                    </option>

                    <option value="prefer_not_to_say">
                      {t("auth.genderPreferNot", "Prefiero no decirlo")}
                    </option>
                  </select>
                </span>
              </label>
            </div>

            <label className="block text-sm font-semibold text-foreground">
              <span>{t("auth.password", "Contraseña")}</span>

              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />

                <input
                  type="password"
                  className="w-full bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                  placeholder={t(
                    "auth.passwordPlaceholder",
                    "Ingresa tu contraseña"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </span>
            </label>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-foreground">
                  {t("auth.passwordSecurity", "Seguridad de la contraseña")}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${passwordStrength.textClass} bg-black/5`}
                >
                  {passwordStrength.label}
                </span>
              </div>

              <div
                className={`mb-4 h-2 overflow-hidden rounded-full ${passwordStrength.barClass}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${passwordStrength.progressClass}`}
                />
              </div>

              <p className="mb-3 text-xs font-semibold text-muted-foreground">
                {t(
                  "auth.passwordMustContain",
                  "Tu contraseña debe contener:"
                )}
              </p>

              <div className="grid gap-2">
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs font-semibold transition ${
                      rule.valid ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {rule.valid ? (
                      <CheckCircle2 size={16} className="shrink-0" />
                    ) : (
                      <Circle size={16} className="shrink-0" />
                    )}

                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <label className="block text-sm font-semibold text-foreground">
              <span>
                {t("auth.confirmPassword", "Confirmar contraseña")}
              </span>

              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-secondary/10">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />

                <input
                  type="password"
                  className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:font-bold placeholder:text-muted-foreground"
                  placeholder={t(
                    "auth.confirmPasswordPlaceholder",
                    "Repite tu contraseña"
                  )}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </span>
            </label>

            {confirmPassword.length > 0 && password !== confirmPassword ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {t("auth.passwordMismatch", "Las contraseñas no coinciden")}
              </p>
            ) : null}

            {confirmPassword.length > 0 && password === confirmPassword ? (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-600">
                {t("auth.passwordMatch", "Las contraseñas coinciden")}
              </p>
            ) : null}

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
                : t("auth.submitRegister", "Crear cuenta")}

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