import type { AdminProduct } from "../../types/admin";
import {
  getLowStockProducts,
  getProductTotalStock,
} from "../../utils/adminUtils";

type AdminLowStockProps = {
  products: AdminProduct[];
};

export function AdminLowStock({ products }: AdminLowStockProps) {
  const lowStockProducts = getLowStockProducts(products);

  return (
    <section className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10">
      <h2 className="font-display text-2xl font-bold text-eagle-foam">
        Productos con stock bajo
      </h2>

      <p className="mt-1 text-sm text-eagle-sand/65">
        Productos con 8 unidades o menos en total.
      </p>

      <div className="mt-5 space-y-3">
        {lowStockProducts.length > 0 ? (
          lowStockProducts.map((product) => (
            <article
              key={product.id}
              className="flex items-center gap-4 rounded-3xl border border-eagle-mist/20 bg-eagle-night/55 p-3"
            >
              <img
                src={
                  product.images[0] ||
                  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900&auto=format&fit=crop"
                }
                alt={product.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-eagle-foam">
                  {product.name}
                </p>

                <p className="text-sm text-eagle-sand/60">
                  {product.category} · {product.collection}
                </p>
              </div>

              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                {getProductTotalStock(product)} uds.
              </span>
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-eagle-mist/20 bg-eagle-night/55 p-5 text-sm text-eagle-sand/65">
            No hay productos con stock bajo.
          </p>
        )}
      </div>
    </section>
  );
}