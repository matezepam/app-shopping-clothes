import { useState } from "react";
import { CheckCircle2, Circle, KeyRound, LockKeyhole, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "../../context/StoreContext";

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const { user, changePassword } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null,
  );

  const passwordRules = [
    {
      label: t("auth.passwordRuleLength", "Mínimo 8 caracteres"),
      valid: form.newPassword.length >= 8,
    },
    {
      label: t("auth.passwordRuleUppercase", "Una letra mayúscula"),
      valid: /[A-Z]/.test(form.newPassword),
    },
    {
      label: t("auth.passwordRuleLowercase", "Una letra minúscula"),
      valid: /[a-z]/.test(form.newPassword),
    },
    {
      label: t("auth.passwordRuleNumber", "Un número"),
      valid: /[0-9]/.test(form.newPassword),
    },
    {
      label: t(
        "auth.passwordRuleSpecial",
        "Un carácter especial, por ejemplo @, #, $, %, &",
      ),
      valid: /[^A-Za-z0-9]/.test(form.newPassword),
    },
  ];

  const validPasswordRules = passwordRules.filter((rule) => rule.valid).length;
  const isPasswordValid = passwordRules.every((rule) => rule.valid);
  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;

  const passwordStrength =
    form.newPassword.length === 0
      ? {
          label: t("auth.passwordStrengthEmpty", "Sin contraseña"),
          textClass: "text-neutral-500",
          barClass: "bg-neutral-100",
          progressClass: "w-0 bg-neutral-200",
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

  const submit = async () => {
    setMessage("");
    setMessageType(null);

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage(t("changePassword.status.required"));
      setMessageType("error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage(t("changePassword.status.mismatch"));
      setMessageType("error");
      return;
    }

    if (!isPasswordValid) {
      setMessage(t("changePassword.status.requirements"));
      setMessageType("error");
      return;
    }

    setSaving(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage(t("changePassword.status.saved"));
      setMessageType("success");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t("changePassword.status.error"),
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
          <LockKeyhole size={34} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-neutral-950">
          {t("profile.authRequired.title")}
        </h1>

        <p className="mt-3 text-neutral-500">
          {t("profile.authRequired.text")}
        </p>

        <Link
          to="/login"
          className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-700"
        >
          {t("profile.authRequired.cta")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-3xl animate-fade-up gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t("changePassword.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-950">
          {t("changePassword.title")}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {t("changePassword.subtitle")}
        </p>
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-neutral-600">
              {t("changePassword.currentPassword")}
            </span>
            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="password"
                value={form.currentPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-neutral-950">
                {t("auth.passwordSecurity", "Seguridad de la contraseña")}
              </p>

              <span
                className={`rounded-full bg-white px-3 py-1 text-xs font-bold ${passwordStrength.textClass}`}
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

            <p className="mb-3 text-xs font-semibold text-neutral-500">
              {t("auth.passwordMustContain", "Tu contraseña debe contener:")}
            </p>

            <div className="grid gap-2">
              {passwordRules.map((rule) => (
                <div
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs font-semibold transition ${
                    rule.valid ? "text-green-600" : "text-neutral-500"
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

          <label className="space-y-2">
            <span className="text-sm font-medium text-neutral-600">
              {t("changePassword.newPassword")}
            </span>
            <div className="relative">
              <KeyRound
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="password"
                value={form.newPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-neutral-600">
              {t("changePassword.confirmPassword")}
            </span>
            <div className="relative">
              <KeyRound
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </label>

          {form.confirmPassword.length > 0 && !passwordsMatch ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {t("changePassword.status.mismatch")}
            </p>
          ) : null}

          {passwordsMatch ? (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-600">
              {t("changePassword.status.match")}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
          >
            {t("changePassword.cancel")}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0f1a] px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-[#0a0f1a]"
          >
            <Save size={17} />
            {saving ? t("changePassword.saving") : t("changePassword.save")}
          </button>
        </div>

        {message ? (
          <p
            className={[
              "mt-3 rounded-2xl px-4 py-3 text-sm font-semibold",
              messageType === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-600",
            ].join(" ")}
          >
            {message}
          </p>
        ) : null}
      </section>
    </section>
  );
}
