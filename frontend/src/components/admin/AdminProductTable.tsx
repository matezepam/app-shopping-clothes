import {
  Edit3,
  Eye,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import type {
  AdminProduct,
  ProductStatus,
  StatusFilter,
} from "../../types/admin";
import {
  getProductPriceRange,
  getProductTotalStock,
  statusLabel,
} from "../../utils/adminUtils";

type AdminProductTableProps = {
  products: AdminProduct[];
  search: string;
  selectedStatus: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
};

export function AdminProductTable({
  products,
  search,
  selectedStatus,
  onSearchChange,
  onStatusChange,
  onEdit,
  onDelete,
  onToggleStatus,
}: AdminProductTableProps) {
  return (
    <section className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-eagle-foam">
            Gestión de productos
          </h2>

          <p className="mt-1 text-sm text-eagle-sand/65">
            Producto base con variantes por color, talla, precio y stock.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-4 py-3">
            <Search size={18} className="text-eagle-sand/50" />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-transparent text-sm font-semibold text-eagle-foam outline-none placeholder:text-eagle-sand/45 sm:w-60"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
            className="rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-4 py-3 text-sm font-bold text-eagle-foam outline-none"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="draft">Borradores</option>
            <option value="disabled">Desactivados</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-eagle-mist/20">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-eagle-night/80 text-xs uppercase tracking-[0.16em] text-eagle-sand/50">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Colección</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Variantes</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const stock = getProductTotalStock(product);

              return (
                <tr
                  key={product.id}
                  className="border-t border-eagle-mist/15 text-eagle-sand/80 transition hover:bg-eagle-night/35"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          product.images[0] ||
                          "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900&auto=format&fit=crop"
                        }
                        alt={product.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-eagle-foam">
                            {product.name}
                          </p>

                          {product.featured ? (
                            <Star
                              size={15}
                              className="fill-eagle-gold text-eagle-gold"
                            />
                          ) : null}
                        </div>

                        <p className="mt-1 line-clamp-1 max-w-xs text-xs text-eagle-sand/55">
                          {product.shortDescription}
                        </p>

                        <p className="mt-1 font-mono text-[11px] text-eagle-sand/40">
                          /product/{product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">{product.category}</td>

                  <td className="p-4">{product.collection || "Sin colección"}</td>

                  <td className="p-4 font-bold text-eagle-foam">
                    {getProductPriceRange(product)}
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-eagle-gold/15 px-3 py-1 text-xs font-bold text-eagle-gold">
                      {product.variants.length} variantes
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        stock <= 8
                          ? "bg-red-500/15 text-red-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {stock} uds.
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.status === "active"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : product.status === "draft"
                            ? "bg-eagle-gold/15 text-eagle-gold"
                            : "bg-eagle-mist/10 text-eagle-sand/60"
                      }`}
                    >
                      {statusLabel(product.status)}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(product.id)}
                        className="rounded-xl border border-eagle-mist/20 bg-eagle-night/70 p-2 text-eagle-sand transition hover:text-eagle-gold"
                        title="Activar / desactivar"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded-xl border border-eagle-mist/20 bg-eagle-night/70 p-2 text-eagle-sand transition hover:text-eagle-gold"
                        title="Editar"
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                        title="Eliminar"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-eagle-sand/60">
                  No se encontraron productos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}