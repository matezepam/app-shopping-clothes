import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Laptop,
  LockKeyhole,
  Mail,
  MapPin,
  Navigation,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../../context/StoreContext";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useStore();
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentLocation, setCurrentLocation] = useState(
    user?.currentLocation ?? "",
  );
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const deviceLabel = useMemo(() => {
    if (typeof navigator === "undefined") return t("settings.devices.unknown");

    const platform = navigator.platform || t("settings.devices.unknown");
    const browser = navigator.userAgent.includes("Firefox")
      ? "Firefox"
      : navigator.userAgent.includes("Edg")
        ? "Edge"
        : navigator.userAgent.includes("Chrome")
          ? "Chrome"
          : navigator.userAgent.includes("Safari")
            ? "Safari"
            : t("settings.devices.browser");

    return `${browser} · ${platform}`;
  }, [t]);

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
          <ShieldCheck size={34} />
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

  const saveEmail = async () => {
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: "error", text: t("settings.status.emailRequired") });
      return;
    }

    setSavingEmail(true);

    try {
      await updateProfile({ email: email.trim() });
      setMessage({ type: "success", text: t("settings.status.emailSaved") });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("settings.status.saveError"),
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const saveLocation = async () => {
    setMessage(null);
    setSavingLocation(true);

    try {
      await updateProfile({ currentLocation: currentLocation.trim() });
      setMessage({
        type: "success",
        text: t("settings.status.locationSaved"),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("settings.status.saveError"),
      });
    } finally {
      setSavingLocation(false);
    }
  };

  const detectLocation = () => {
    setMessage(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setMessage({
        type: "error",
        text: t("settings.status.locationUnsupported"),
      });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setCurrentLocation(`${lat}, ${lng}`);
        setMessage({
          type: "success",
          text: t("settings.status.locationDetected"),
        });
        setLocating(false);
      },
      () => {
        setMessage({
          type: "error",
          text: t("settings.status.locationDenied"),
        });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl animate-fade-up gap-6">
      <div className="rounded-[2rem] bg-[#0a0f1a] p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t("settings.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{t("settings.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
          {t("settings.subtitle")}
        </p>
      </div>

      {message ? (
        <p
          className={[
            "rounded-2xl px-4 py-3 text-sm font-semibold",
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-600",
          ].join(" ")}
        >
          {message.text}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-neutral-950">
              <Mail size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">
                {t("settings.email.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {t("settings.email.text")}
              </p>
            </div>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-semibold text-neutral-600">
              {t("settings.email.label")}
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </label>

          <button
            type="button"
            disabled={savingEmail}
            onClick={() => void saveEmail()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {savingEmail ? t("settings.saving") : t("settings.email.save")}
          </button>
        </section>

        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-neutral-950">
              <LockKeyhole size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">
                {t("settings.password.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {t("settings.password.text")}
              </p>
            </div>
          </div>

          <Link
            to="/change-password"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
          >
            <LockKeyhole size={17} />
            {t("settings.password.cta")}
          </Link>
        </section>

        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-neutral-950">
              <Laptop size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">
                {t("settings.devices.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {t("settings.devices.text")}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-bold text-neutral-950">
              {t("settings.devices.current")}
            </p>
            <p className="mt-1 text-sm text-neutral-500">{deviceLabel}</p>
            <span className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              {t("settings.devices.active")}
            </span>
          </div>
        </section>

        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-neutral-950">
              <MapPin size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">
                {t("settings.location.title")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-500">
                {t("settings.location.text")}
              </p>
            </div>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-semibold text-neutral-600">
              {t("settings.location.label")}
            </span>
            <input
              type="text"
              value={currentLocation}
              onChange={(event) => setCurrentLocation(event.target.value)}
              placeholder={t("settings.location.placeholder")}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={locating}
              onClick={detectLocation}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Navigation size={17} />
              {locating
                ? t("settings.location.detecting")
                : t("settings.location.detect")}
            </button>

            <button
              type="button"
              disabled={savingLocation}
              onClick={() => void saveLocation()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {savingLocation
                ? t("settings.saving")
                : t("settings.location.save")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
