import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Globe2,
  Heart,
  History,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";
import { persistLanguage } from "../../i18n/config";
import type { CurrencyCode } from "../../types/store";

const userAvatar = "/images/profile/login-avatar.svg";

type Tab = "profile" | "security" | "preferences" | "activity";

const languageOptions = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
] as const;

function formatUtcDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const {
    user,
    currency,
    setCurrency,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    orders,
    cart,
    wishlistProductIds,
    catalog,
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState<Tab>("profile");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    gender: "",
    age: "",
    preferredLanguage: i18n.language,
    preferredCurrency: currency,
  });
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      country: user.country ?? "",
      gender: user.gender ?? "",
      age: user.age ? String(user.age) : "",
      preferredLanguage: user.preferredLanguage ?? i18n.language,
      preferredCurrency: user.preferredCurrency ?? currency,
    });
  }, [user]);

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const pendingText = t("profile.common.pending");

  const totalSpentUsd = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalUsd, 0),
    [orders],
  );

  const cartTotalUsd = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = catalog.find((p) => p.id === item.productId);
        return sum + (product?.priceUsd ?? 0) * item.quantity;
      }, 0),
    [cart, catalog],
  );

  const menuItems: {
    id: Tab;
    label: string;
    icon: typeof UserRound;
  }[] = [
    { id: "profile", label: t("profile.tabs.profile"), icon: UserRound },
    { id: "security", label: t("profile.tabs.security"), icon: ShieldCheck },
    {
      id: "preferences",
      label: t("profile.tabs.preferences"),
      icon: SlidersHorizontal,
    },
    { id: "activity", label: t("profile.tabs.activity"), icon: LayoutDashboard },
  ];

  const searchItems = useMemo(
    () =>
      menuItems.map((item) => ({
        ...item,
        terms: [
          item.label,
          t(`profile.searchTerms.${item.id}`),
        ]
          .join(" ")
          .toLocaleLowerCase(),
      })),
    [menuItems, t],
  );

  const visibleMenuItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    if (!query) return menuItems;

    return searchItems.filter((item) => item.terms.includes(query));
  }, [menuItems, searchItems, searchQuery]);

  useEffect(() => {
    if (visibleMenuItems.length === 0) return;
    if (visibleMenuItems.some((item) => item.id === tab)) return;

    setTab(visibleMenuItems[0].id);
  }, [tab, visibleMenuItems]);

  useEffect(() => {
    return () => {
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    };
  }, [pendingAvatarPreview]);

  const formatGender = (value?: string | null) => {
    if (!value) return pendingText;

    const key = `profile.genders.${value}`;
    const translated = t(key);

    return translated === key ? value : translated;
  };

  const saveProfile = async () => {
    setSaving(true);
    setStatusMessage("");

    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        gender: form.gender,
        age: form.age.trim() ? Number(form.age) : undefined,
        preferredLanguage: form.preferredLanguage,
        preferredCurrency: form.preferredCurrency as CurrencyCode,
      });

      setStatusMessage(t("profile.status.saved"));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t("profile.status.saveError"),
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (!user) return;

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      country: user.country ?? "",
      gender: user.gender ?? "",
      age: user.age ? String(user.age) : "",
      preferredLanguage: user.preferredLanguage ?? i18n.language,
      preferredCurrency: user.preferredCurrency ?? currency,
    });
    setStatusMessage("");
  };

  const changeLanguagePreference = async (lng: string) => {
    setForm((current) => ({ ...current, preferredLanguage: lng }));
    await i18n.changeLanguage(lng);
    persistLanguage(lng);

    try {
      await updateProfile({ preferredLanguage: lng });
      setStatusMessage(t("profile.status.languageSaved"));
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : t("profile.status.languageError"),
      );
    }
  };

  const changeCurrencyPreference = async (code: CurrencyCode) => {
    setForm((current) => ({ ...current, preferredCurrency: code }));
    setCurrency(code);

    try {
      await updateProfile({ preferredCurrency: code });
      setStatusMessage(t("profile.status.currencySaved"));
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : t("profile.status.currencyError"),
      );
    }
  };

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage(t("profile.status.avatarTooLarge"));
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setStatusMessage(t("profile.status.avatarInvalid"));
      return;
    }

    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatarFile(file);
    setPendingAvatarPreview(URL.createObjectURL(file));
    setStatusMessage(t("profile.status.avatarReady"));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmAvatarChange = async () => {
    if (!pendingAvatarFile) return;

    setAvatarSaving(true);
    setStatusMessage("");

    try {
      await uploadAvatar(pendingAvatarFile);
      setStatusMessage(t("profile.status.avatarSaved"));
      if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
      setPendingAvatarFile(null);
      setPendingAvatarPreview("");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t("profile.status.avatarError"),
      );
    } finally {
      setAvatarSaving(false);
    }
  };

  const cancelAvatarChange = () => {
    if (pendingAvatarPreview) URL.revokeObjectURL(pendingAvatarPreview);
    setPendingAvatarFile(null);
    setPendingAvatarPreview("");
    setStatusMessage("");
  };

  const handleDeleteAvatar = async () => {
    setAvatarSaving(true);
    setStatusMessage("");

    try {
      await deleteAvatar();
      setStatusMessage(t("profile.status.avatarDeleted"));
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : t("profile.status.avatarError"),
      );
    } finally {
      setAvatarSaving(false);
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
    <section className="mx-auto w-full max-w-7xl animate-fade-up">
      <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-2xl shadow-black/10">
        <div className="grid min-h-[720px] lg:grid-cols-[280px_1fr]">
          <aside className="relative overflow-hidden bg-[#0a0f1a] p-5 text-white">
            <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />

            <div className="relative flex h-full flex-col">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-[#0a0f1a]">
                  S
                </div>

                <div>
                  <p className="text-sm font-bold">Sprint</p>
                  <p className="text-xs text-white/50">
                    {t("profile.sidebar.accountCenter")}
                  </p>
                </div>
              </Link>

              <div className="mt-8 rounded-3xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                      src={user.avatarUrl || userAvatar}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{fullName}</p>
                    <p className="truncate text-xs text-white/50">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-[11px] font-bold text-primary">
                    {user.roles.includes("ADMIN") ? "ADMIN" : "USER"}
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    {t("profile.common.active")}
                  </span>
                </div>
              </div>

              <nav className="mt-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                  onClick={() => setTab(item.id)}
                      className={[
                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                        active
                          ? "bg-white text-[#0a0f1a] shadow-lg shadow-black/10"
                          : "text-white/65 hover:bg-white/10 hover:text-white",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 grid gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <LayoutDashboard size={18} />
                  {t("profile.links.dashboard")}
                </Link>

                <Link
                  to="/favorites"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <Heart size={18} />
                  {t("profile.links.favorites")}
                </Link>

                <Link
                  to="/history"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <History size={18} />
                  {t("profile.links.history")}
                </Link>
              </div>

              <div className="mt-auto rounded-3xl bg-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50">
                      {t("profile.sidebar.completed")}
                    </p>
                    <p className="mt-1 text-lg font-black">80%</p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary text-xs font-black text-primary">
                    80%
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-white/50">
                  {t("profile.sidebar.note")}
                </p>
              </div>
            </div>
          </aside>

          <main className="bg-neutral-50 p-5 md:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  {t("profile.hero.eyebrow")}
                </p>

                <h1 className="mt-2 text-3xl font-bold text-neutral-950">
                  {t("profile.hero.title")}
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  {t("profile.hero.subtitle")}
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder={t("profile.hero.search")}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary md:w-72"
                />
              </div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto rounded-3xl border border-neutral-200 bg-white p-2">
              {visibleMenuItems.map((item) => {
                const active = tab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={[
                      "shrink-0 rounded-2xl px-4 py-2 text-sm font-bold transition",
                      active
                        ? "bg-[#0a0f1a] text-white"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {searchQuery.trim() && visibleMenuItems.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center">
                <p className="font-bold text-neutral-800">
                  {t("profile.search.emptyTitle")}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {t("profile.search.emptyText")}
                </p>
              </div>
            ) : null}

            {visibleMenuItems.length > 0 && tab === "profile" ? (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-xl font-bold text-neutral-950">
                      {t("profile.profile.title")}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {t("profile.profile.subtitle")}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6">
                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          {t("profile.avatar.title")}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {t("profile.avatar.subtitle")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                          <img
                            src={pendingAvatarPreview || user.avatarUrl || userAvatar}
                            alt={fullName}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(event) =>
                            void handleAvatarChange(event.target.files?.[0])
                          }
                        />

                        <button
                          type="button"
                          disabled={avatarSaving}
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                        >
                          {avatarSaving
                            ? t("profile.common.saving")
                            : t("profile.avatar.change")}
                        </button>

                        <button
                          type="button"
                          disabled={avatarSaving}
                          onClick={() => void handleDeleteAvatar()}
                          className="rounded-full px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
                        >
                          {t("profile.avatar.delete")}
                        </button>

                        {pendingAvatarFile ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={avatarSaving}
                              onClick={() => void confirmAvatarChange()}
                              className="rounded-full bg-[#0a0f1a] px-4 py-2 text-sm font-bold text-white transition hover:bg-primary hover:text-[#0a0f1a]"
                            >
                              {t("profile.avatar.confirm")}
                            </button>

                            <button
                              type="button"
                              disabled={avatarSaving}
                              onClick={cancelAvatarChange}
                              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                            >
                              {t("profile.avatar.cancel")}
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <p className="text-xs text-neutral-400 md:col-start-2">
                        {t("profile.avatar.requirements")}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          {t("profile.personal.title")}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {t("profile.personal.subtitle")}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.firstName")}
                          </span>
                          <input
                            value={form.firstName}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                firstName: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.lastName")}
                          </span>
                          <input
                            value={form.lastName}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                lastName: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.email")}
                          </span>
                          <div className="relative">
                            <Mail
                              size={17}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                              value={form.email}
                              onChange={(event) =>
                                setForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-primary"
                            />
                          </div>
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.phone")}
                          </span>
                          <div className="relative">
                            <Phone
                              size={17}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                              value={form.phone}
                              onChange={(event) =>
                                setForm((current) => ({
                                  ...current,
                                  phone: event.target.value,
                                }))
                              }
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-primary"
                            />
                          </div>
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.country")}
                          </span>
                          <div className="relative">
                            <MapPin
                              size={17}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <input
                              value={form.country}
                              onChange={(event) =>
                                setForm((current) => ({
                                  ...current,
                                  country: event.target.value,
                                }))
                              }
                              className="w-full rounded-2xl border border-neutral-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-primary"
                            />
                          </div>
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.age")}
                          </span>
                          <input
                            value={form.age}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                age: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                          />
                        </label>

                        <label className="space-y-2 md:col-span-2">
                          <span className="text-sm font-medium text-neutral-600">
                            {t("profile.fields.gender")}
                          </span>
                          <select
                            value={form.gender}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                gender: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
                          >
                            <option value="">
                              {t("profile.fields.select")}
                            </option>
                            <option value="male">
                              {t("profile.genders.male")}
                            </option>
                            <option value="female">
                              {t("profile.genders.female")}
                            </option>
                            <option value="non_binary">
                              {t("profile.genders.non_binary")}
                            </option>
                            <option value="prefer_not_to_say">
                              {t("profile.genders.prefer_not_to_say")}
                            </option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          {t("profile.accountStatus.title")}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {t("profile.accountStatus.subtitle")}
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl bg-neutral-50 p-4">
                          <p className="text-xs text-neutral-500">
                            {t("profile.accountStatus.role")}
                          </p>
                          <p className="mt-2 font-bold text-neutral-950">
                            {user.roles.includes("ADMIN") ? "ADMIN" : "USER"}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-neutral-50 p-4">
                          <p className="text-xs text-neutral-500">
                            {t("profile.accountStatus.createdAt")}
                          </p>
                          <p className="mt-2 text-sm font-bold text-neutral-950">
                            {formatUtcDate(
                              user.createdAt,
                              i18n.language,
                              pendingText,
                            )}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-neutral-50 p-4">
                          <p className="text-xs text-neutral-500">
                            {t("profile.accountStatus.registeredGender")}
                          </p>
                          <p className="mt-2 font-bold text-neutral-950">
                            {formatGender(user.gender)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={saving}
                      className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {t("profile.actions.cancel")}
                    </button>

                    <button
                      type="button"
                      onClick={() => void saveProfile()}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0f1a] px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-[#0a0f1a]"
                    >
                      <Save size={17} />
                      {saving
                        ? t("profile.common.saving")
                        : t("profile.actions.save")}
                    </button>
                  </div>

                  {statusMessage ? (
                    <p className="mt-3 text-right text-xs text-neutral-400">
                      {statusMessage}
                    </p>
                  ) : null}
                </section>
              </div>
            ) : null}

            {visibleMenuItems.length > 0 && tab === "security" ? (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-xl font-bold text-neutral-950">
                      {t("profile.security.title")}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {t("profile.security.subtitle")}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                            <CheckCircle2 size={24} />
                          </div>

                          <div>
                            <h3 className="font-bold text-emerald-900">
                              {t("profile.security.emailVerifiedTitle")}
                            </h3>
                            <p className="mt-1 text-sm text-emerald-700">
                              {t("profile.security.emailVerifiedText")}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700">
                          {t("profile.common.active")}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-white">
                            <Phone size={24} />
                          </div>

                          <div>
                            <h3 className="font-bold text-amber-900">
                              {t("profile.security.phoneTitle")}
                            </h3>
                            <p className="mt-1 text-sm text-amber-700">
                              {t("profile.security.phoneText")}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-amber-700">
                          {t("profile.common.pending")}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a0f1a] text-white">
                            <KeyRound size={24} />
                          </div>

                          <div>
                            <h3 className="font-bold text-neutral-950">
                              {t("profile.security.twoFactorTitle")}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                              {t("profile.security.twoFactorText")}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
                        >
                          {t("profile.security.activate2fa")}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950">
                            <LockKeyhole size={24} />
                          </div>

                          <div>
                            <h3 className="font-bold text-neutral-950">
                              {t("profile.security.passwordTitle")}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                              {t("profile.security.passwordText")}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/change-password"
                          className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                        >
                          {t("profile.security.changePassword")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {visibleMenuItems.length > 0 && tab === "preferences" ? (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-xl font-bold text-neutral-950">
                      {t("profile.preferences.title")}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {t("profile.preferences.subtitle")}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5">
                    <div className="rounded-3xl border border-neutral-200 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-neutral-950">
                          <CreditCard size={24} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-950">
                            {t("profile.preferences.currencyTitle")}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-500">
                            {t("profile.preferences.currencyText")}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3">
                            {(["USD", "EUR", "GBP"] as const).map((code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => void changeCurrencyPreference(code)}
                                className={[
                                  "rounded-full px-5 py-3 text-sm font-bold transition",
                                  form.preferredCurrency === code
                                    ? "bg-[#0a0f1a] text-white"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                                ].join(" ")}
                              >
                                {code}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950">
                          <Globe2 size={24} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-950">
                            {t("profile.preferences.languageTitle")}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-500">
                            {t("profile.preferences.languageText")}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3">
                            {languageOptions.map((language) => (
                              <button
                                key={language.code}
                                type="button"
                                onClick={() =>
                                  void changeLanguagePreference(language.code)
                                }
                                className={[
                                  "rounded-full px-5 py-3 text-sm font-bold transition",
                                  form.preferredLanguage === language.code
                                    ? "bg-[#0a0f1a] text-white"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                                ].join(" ")}
                              >
                                {language.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950">
                          <Bell size={24} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-neutral-950">
                            {t("profile.preferences.notificationsTitle")}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-500">
                            {t("profile.preferences.notificationsText")}
                          </p>

                          <div className="mt-4 grid gap-3">
                            {[
                              t("profile.notifications.orders"),
                              t("profile.notifications.security"),
                              t("profile.notifications.promos"),
                            ].map((label) => (
                              <label
                                key={label}
                                className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4"
                              >
                                <span className="text-sm font-semibold text-neutral-700">
                                  {label}
                                </span>

                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="h-5 w-5 accent-neutral-950"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {visibleMenuItems.length > 0 && tab === "activity" ? (
              <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <ShoppingBag className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      {t("profile.activity.orders")}
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {orders.length}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <CreditCard className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      {t("profile.activity.spent")}
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {formatMoney(fromUsd(totalSpentUsd, currency), currency)}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <Heart className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      {t("profile.activity.favorites")}
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {wishlistProductIds.length}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <ShoppingBag className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      {t("profile.activity.currentCart")}
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {formatMoney(fromUsd(cartTotalUsd, currency), currency)}
                    </p>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-neutral-950">
                    {t("profile.activity.recentTitle")}
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    {t("profile.activity.recentText")}
                  </p>

                  <div className="mt-6 space-y-3">
                    {orders.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-neutral-300 p-8 text-center">
                        <p className="font-bold text-neutral-800">
                          {t("profile.activity.emptyTitle")}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {t("profile.activity.emptyText")}
                        </p>
                      </div>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-3xl bg-neutral-50 p-4"
                        >
                          <div>
                            <p className="font-bold text-neutral-950">
                              {t("profile.activity.orderNumber", {
                                id: order.id,
                              })}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {formatUtcDate(
                                order.createdAt,
                                i18n.language,
                                pendingText,
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-neutral-950">
                              {formatMoney(
                                fromUsd(order.totalUsd, currency),
                                currency,
                              )}
                            </p>
                            <p className="text-xs uppercase tracking-wider text-neutral-400">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </section>
  );
}
