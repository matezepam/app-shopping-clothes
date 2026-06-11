import type { SalesPoint } from "../../types/admin";
import { formatMoney } from "../../utils/adminUtils";

type AdminSalesChartProps = {
  data: SalesPoint[];
};

export function AdminSalesChart({ data }: AdminSalesChartProps) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <section className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-eagle-foam">
            Ventas demo
          </h2>

          <p className="mt-1 text-sm text-eagle-sand/65">
            Simulación visual del rendimiento semanal.
          </p>
        </div>

        <span className="rounded-full border border-eagle-mist/25 bg-eagle-night/70 px-3 py-1 text-xs font-bold text-eagle-sand/70">
          Últimos 7 días
        </span>
      </div>

      <div className="flex h-56 items-end gap-3 rounded-3xl border border-eagle-mist/20 bg-eagle-night/45 p-5">
        {data.map((item) => {
          const height = (item.value / max) * 100;

          return (
            <div
              key={item.day}
              className="flex flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className="w-full max-w-10 rounded-t-2xl bg-eagle-gold/85 shadow-lg shadow-eagle-gold/10 transition hover:bg-eagle-foam"
                style={{ height: `${Math.max(height, 12)}%` }}
                title={`${item.day}: ${formatMoney(item.value)}`}
              />

              <span className="text-xs font-bold text-eagle-sand/55">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}