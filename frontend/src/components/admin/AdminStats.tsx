import { Activity, Plus } from "lucide-react";

type AdminHeroProps = {
  onCreateProduct: () => void;
};

export function AdminHero({ onCreateProduct }: AdminHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-eagle-mist/25 bg-[#090f18] p-6 shadow-2xl shadow-black/25 sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-eagle-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-eagle-mist/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-eagle-mist/25 bg-eagle-night/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/70">
            <Activity size={15} className="text-eagle-gold" />
            Admin Demo
          </div>

          <h1 className="font-display text-4xl font-bold text-eagle-foam sm:text-5xl">
            Panel administrativo
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-eagle-sand/75">
            Gestiona productos, variantes, stock, imágenes y devoluciones desde
            una vista demo. Luego el backend se encargará de guardar todo.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateProduct}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-eagle-gold px-5 py-3 text-sm font-bold text-eagle-night shadow-lg shadow-eagle-gold/20 transition hover:-translate-y-0.5 hover:bg-eagle-foam"
        >
          <Plus size={18} />
          Agregar producto
        </button>
      </div>
    </section>
  );
}