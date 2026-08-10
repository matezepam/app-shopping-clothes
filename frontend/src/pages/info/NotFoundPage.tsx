import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-950 text-primary shadow-2xl shadow-black/15">
        <SearchX aria-hidden size={34} />
      </div>
      <p className="mt-8 text-xs font-black uppercase tracking-[0.28em] text-accent">Error 404</p>
      <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-6xl">Esta página no existe</h1>
      <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
        El enlace pudo cambiar o el contenido ya no está disponible. Puedes volver al catálogo y continuar comprando.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-accent">
          <Home aria-hidden size={18} /> Ir al inicio
        </Link>
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 font-bold transition hover:-translate-y-0.5 hover:border-accent hover:text-accent">
          <ArrowLeft aria-hidden size={18} /> Volver
        </button>
      </div>
    </section>
  );
}
