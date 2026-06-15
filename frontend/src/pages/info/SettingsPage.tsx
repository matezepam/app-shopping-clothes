import { useStore } from "../../context/StoreContext";

const userAvatar = "/images/profile/login-avatar.svg";

export default function SettingsPage() {
  const { user, currency, setCurrency } = useStore();

  return (
    <section className="animate-fade-up space-y-8">
      <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Configuraciones
        </p>
        <h1 className="mt-3 text-3xl font-bold text-neutral-950">
          Preferencias de cuenta
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-500">
          Personaliza tu experiencia en Sprint. Algunas opciones son visuales por
          ahora y luego las conectaremos con el backend.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-100 shadow-inner">
              <img
                src={user?.avatarUrl || userAvatar}
                alt="Avatar"
                className="h-20 w-20 object-contain"
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-neutral-950">
              {user?.firstName} {user?.lastName}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>

            <button
              type="button"
              className="mt-5 rounded-full bg-neutral-950 px-5 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-700"
            >
              Cambiar avatar
            </button>

            <p className="mt-3 text-xs text-neutral-400">
              Disponible cuando agreguemos subida de imágenes.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-950">
              Información personal
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-600">
                  Nombre
                </span>
                <input
                  value={user?.firstName ?? ""}
                  readOnly
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-neutral-600">
                  Apellido
                </span>
                <input
                  value={user?.lastName ?? ""}
                  readOnly
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-neutral-600">
                  Correo electrónico
                </span>
                <input
                  value={user?.email ?? ""}
                  readOnly
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-950">
              Preferencia de moneda
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">
              {(["USD", "EUR", "GBP"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={[
                    "rounded-full px-5 py-3 text-sm font-bold transition",
                    currency === code
                      ? "bg-neutral-950 text-white shadow-lg"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                  ].join(" ")}
                >
                  {code}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-950">Seguridad</h2>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                className="rounded-2xl bg-neutral-50 px-4 py-4 text-left font-semibold text-neutral-800 transition hover:bg-neutral-950 hover:text-white"
              >
                Cambiar contraseña
              </button>

              <button
                type="button"
                className="rounded-2xl bg-neutral-50 px-4 py-4 text-left font-semibold text-neutral-800 transition hover:bg-neutral-950 hover:text-white"
              >
                Activar verificación adicional
              </button>
            </div>

            <p className="mt-4 text-xs text-neutral-400">
              Estas opciones se conectarán cuando agreguemos endpoints de cuenta.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}