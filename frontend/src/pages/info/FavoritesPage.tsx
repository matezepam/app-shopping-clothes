import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

export default function FavoritesPage() {
  const {
    catalog,
    wishlistProductIds,
    currency,
    addToCart,
    toggleWishlist,
  } = useStore();

  const favorites = catalog.filter((product) =>
    wishlistProductIds.includes(product.id),
  );

  const totalUsd = favorites.reduce((sum, product) => sum + product.priceUsd, 0);

  return (
    <section className="animate-fade-up space-y-8">
      <div className="rounded-[2rem] bg-[#0a0f1a] p-8 text-white shadow-2xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          Favoritos
        </p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Tus productos guardados
        </h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Guarda tus prendas favoritas, compáralas y agrégalas al carrito cuando
          estés listo para comprar.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-semibold">
          Total estimado:{" "}
          <span className="ml-2 text-primary">
            {formatMoney(fromUsd(totalUsd, currency), currency)}
          </span>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-950">
            No tienes favoritos todavía.
          </h2>
          <p className="mt-2 text-neutral-500">
            Explora el catálogo y guarda los productos que más te gusten.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-700"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {product.subcategory}
                </p>

                <h2 className="mt-2 text-lg font-bold text-neutral-950">
                  {product.name}
                </h2>

                <p className="mt-2 font-bold text-neutral-950">
                  {formatMoney(fromUsd(product.priceUsd, currency), currency)}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="flex-1 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
                  >
                    Agregar
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}