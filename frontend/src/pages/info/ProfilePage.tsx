import { useEffect, useMemo, useState } from "react";
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
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

const userAvatar = "/images/profile/login-avatar.svg";

type Tab = "profile" | "security" | "preferences" | "activity";

function formatUtcDate(value?: string | null) {
  if (!value) return "Pendiente";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Pendiente";

  return new Intl.DateTimeFormat("es-EC", {
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

function formatGender(value?: string | null) {
  if (!value) return "Pendiente";

  const genders: Record<string, string> = {
    male: "Masculino",
    female: "Femenino",
    non_binary: "No binario",
    prefer_not_to_say: "Prefiero no decirlo",
  };

  return genders[value] ?? value;
}

export default function SettingsPage() {
  const {
    user,
    currency,
    setCurrency,
    orders,
    cart,
    wishlistProductIds,
    catalog,
  } = useStore();

  const [tab, setTab] = useState<Tab>("profile");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    gender: "",
    age: "",
  });

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
    });
  }, [user]);

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

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
    { id: "profile", label: "Perfil", icon: UserRound },
    { id: "security", label: "Seguridad", icon: ShieldCheck },
    { id: "preferences", label: "Preferencias", icon: SlidersHorizontal },
    { id: "activity", label: "Actividad", icon: LayoutDashboard },
  ];

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-primary">
          <LockKeyhole size={34} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-neutral-950">
          Inicia sesión
        </h1>

        <p className="mt-3 text-neutral-500">
          Necesitas acceder a tu cuenta para ver tus configuraciones.
        </p>

        <Link
          to="/login"
          className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-700"
        >
          Ir al login
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
                  <p className="text-xs text-white/50">Account Center</p>
                </div>
              </Link>

              <div className="mt-8 rounded-3xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
                    <img
                      src={user.avatarUrl || userAvatar}
                      alt={fullName}
                      className="h-10 w-10 object-contain"
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
                    Activa
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
                  Dashboard
                </Link>

                <Link
                  to="/favorites"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <Heart size={18} />
                  Favoritos
                </Link>

                <Link
                  to="/history"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <History size={18} />
                  Historial
                </Link>
              </div>

              <div className="mt-auto rounded-3xl bg-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50">Perfil completado</p>
                    <p className="mt-1 text-lg font-black">80%</p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-primary text-xs font-black text-primary">
                    80%
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-white/50">
                  Más adelante podrás verificar teléfono, cambiar avatar y
                  activar seguridad avanzada.
                </p>
              </div>
            </div>
          </aside>

          <main className="bg-neutral-50 p-5 md:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  Settings
                </p>

                <h1 className="mt-2 text-3xl font-bold text-neutral-950">
                  Configuración de cuenta
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Administra tu perfil, seguridad y preferencias de compra.
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar configuración..."
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary md:w-72"
                />
              </div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto rounded-3xl border border-neutral-200 bg-white p-2">
              {menuItems.map((item) => {
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

            {tab === "profile" ? (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-xl font-bold text-neutral-950">
                      Perfil
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Actualiza tu información personal y datos de contacto.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-6">
                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Foto de perfil
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Se mostrará en tu cuenta.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                          <img
                            src={user.avatarUrl || userAvatar}
                            alt={fullName}
                            className="h-14 w-14 object-contain"
                          />
                        </div>

                        <button
                          type="button"
                          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                        >
                          Cambiar
                        </button>

                        <button
                          type="button"
                          className="rounded-full px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Datos personales
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Información principal de tu cuenta.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-neutral-600">
                            Nombre
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
                            Apellido
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
                            Correo electrónico
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
                            Teléfono
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
                            País
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
                            Edad
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
                            Género
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
                            <option value="">Seleccionar</option>
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="non_binary">No binario</option>
                            <option value="prefer_not_to_say">
                              Prefiero no decirlo
                            </option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                      <div>
                        <p className="text-sm font-semibold text-neutral-700">
                          Estado de cuenta
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Información interna del perfil.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl bg-neutral-50 p-4">
                          <p className="text-xs text-neutral-500">Rol</p>
                          <p className="mt-2 font-bold text-neutral-950">
                            {user.roles.includes("ADMIN") ? "ADMIN" : "USER"}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-neutral-50 p-4">
                          <p className="text-xs text-neutral-500">Creación UTC</p>
                          <p className="mt-2 text-sm font-bold text-neutral-950">
                            {formatUtcDate(user.createdAt)}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-neutral-50 p-4">
                          <p className="text-xs text-neutral-500">
                            Género registrado
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
                      className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0f1a] px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-[#0a0f1a]"
                    >
                      <Save size={17} />
                      Guardar cambios
                    </button>
                  </div>

                  <p className="mt-3 text-right text-xs text-neutral-400">
                    El guardado se conectará luego con el backend.
                  </p>
                </section>
              </div>
            ) : null}

            {tab === "security" ? (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-xl font-bold text-neutral-950">
                      Seguridad
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Controla el acceso, verificación y protección de tu cuenta.
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
                              Correo verificado
                            </h3>
                            <p className="mt-1 text-sm text-emerald-700">
                              Tu correo está registrado correctamente.
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700">
                          Activo
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
                              Verificación telefónica
                            </h3>
                            <p className="mt-1 text-sm text-amber-700">
                              Tu teléfono está registrado, pero la verificación
                              se agregará más adelante.
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-amber-700">
                          Pendiente
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
                              Configuración de dos pasos
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                              Protege tu cuenta con un segundo método de
                              verificación.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
                        >
                          Activar 2FA
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
                              Contraseña
                            </h3>
                            <p className="mt-1 text-sm text-neutral-500">
                              Cambia tu contraseña periódicamente para mantener
                              tu cuenta segura.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
                        >
                          Cambiar contraseña
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}

            {tab === "preferences" ? (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-neutral-100 pb-5">
                    <h2 className="text-xl font-bold text-neutral-950">
                      Preferencias
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Personaliza idioma, moneda y notificaciones.
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
                            Moneda
                          </h3>
                          <p className="mt-1 text-sm text-neutral-500">
                            Selecciona la moneda para visualizar precios.
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3">
                            {(["USD", "EUR", "GBP"] as const).map((code) => (
                              <button
                                key={code}
                                type="button"
                                onClick={() => setCurrency(code)}
                                className={[
                                  "rounded-full px-5 py-3 text-sm font-bold transition",
                                  currency === code
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
                            Idioma automático
                          </h3>
                          <p className="mt-1 text-sm text-neutral-500">
                            Más adelante cambiará según la ubicación o la
                            preferencia del usuario.
                          </p>

                          <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
                            <p className="text-sm text-neutral-500">
                              País registrado
                            </p>
                            <p className="mt-1 font-bold text-neutral-950">
                              {user.country || "Pendiente"}
                            </p>
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
                            Notificaciones
                          </h3>
                          <p className="mt-1 text-sm text-neutral-500">
                            Recibe avisos sobre pedidos, promociones y seguridad.
                          </p>

                          <div className="mt-4 grid gap-3">
                            {[
                              "Notificaciones de pedidos",
                              "Alertas de seguridad",
                              "Promociones y novedades",
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

            {tab === "activity" ? (
              <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <ShoppingBag className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      Órdenes realizadas
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {orders.length}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <CreditCard className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      Dinero gastado
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {formatMoney(fromUsd(totalSpentUsd, currency), currency)}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <Heart className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">Favoritos</p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {wishlistProductIds.length}
                    </p>
                  </div>

                  <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <ShoppingBag className="text-primary" size={26} />
                    <p className="mt-4 text-sm text-neutral-500">
                      Carrito actual
                    </p>
                    <p className="mt-2 text-3xl font-black text-neutral-950">
                      {formatMoney(fromUsd(cartTotalUsd, currency), currency)}
                    </p>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-neutral-950">
                    Actividad reciente
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Resumen de pedidos y movimientos de la cuenta.
                  </p>

                  <div className="mt-6 space-y-3">
                    {orders.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-neutral-300 p-8 text-center">
                        <p className="font-bold text-neutral-800">
                          Todavía no tienes órdenes.
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Cuando realices compras aparecerán en esta sección.
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
                              Pedido #{order.id}
                            </p>
                            <p className="text-sm text-neutral-500">
                              {formatUtcDate(order.createdAt)}
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