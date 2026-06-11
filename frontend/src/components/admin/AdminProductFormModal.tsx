import { CheckCircle2, Plus, Trash2, X } from "lucide-react";
import type { AdminProduct, ProductStatus } from "../../types/admin";
import { categoryOptions } from "../../data/adminDemoData";

type AdminProductFormModalProps = {
  form: AdminProduct;
  editingId: string | null;
  onChange: (product: AdminProduct) => void;
  onSave: () => void;
  onClose: () => void;
};

export function AdminProductFormModal({
  form,
  editingId,
  onChange,
  onSave,
  onClose,
}: AdminProductFormModalProps) {
  const updateField = <K extends keyof AdminProduct>(
    key: K,
    value: AdminProduct[K]
  ) => {
    onChange({
      ...form,
      [key]: value,
    });
  };

  const updateVariant = (
    index: number,
    key: keyof AdminProduct["variants"][number],
    value: string | number
  ) => {
    const nextVariants = [...form.variants];

    nextVariants[index] = {
      ...nextVariants[index],
      [key]: value,
    };

    updateField("variants", nextVariants);
  };

  const addVariant = () => {
    updateField("variants", [
      ...form.variants,
      {
        id: `variant_${Date.now()}`,
        sku: "",
        colorName: "Black",
        colorHex: "#111827",
        size: "M",
        price: 0,
        stock: 0,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    updateField(
      "variants",
      form.variants.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-eagle-mist/25 bg-[#09111d] p-5 shadow-2xl shadow-black/40 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-eagle-foam">
              {editingId ? "Editar producto" : "Agregar producto"}
            </h2>

            <p className="mt-2 text-sm text-eagle-sand/65">
              Producto base con variantes por color, talla, precio y stock.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-eagle-mist/20 bg-eagle-night/70 p-3 text-eagle-sand transition hover:text-eagle-foam"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/55 p-4">
            <div className="aspect-square overflow-hidden rounded-3xl bg-eagle-night">
              <img
                src={
                  form.images[0] ||
                  "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900&auto=format&fit=crop"
                }
                alt="Vista previa"
                className="h-full w-full object-cover"
              />
            </div>

            <label className="mt-4 block text-sm font-bold text-eagle-foam">
              Imágenes por URL
              <textarea
                value={form.images.join("\n")}
                onChange={(event) =>
                  updateField(
                    "images",
                    event.target.value
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                rows={5}
                placeholder="https://imagen-1.jpg&#10;https://imagen-2.jpg"
                className="mt-2 w-full resize-none rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
              />
            </label>

            <p className="mt-3 text-xs leading-5 text-eagle-sand/50">
              Por ahora pega URLs. Luego esto se reemplaza por subida real a
              Cloudinary, Firebase Storage o S3 desde el backend.
            </p>
          </section>

          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-eagle-foam">
                Nombre
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Camiseta Oversize Rosas"
                  className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                />
              </label>

              <label className="block text-sm font-bold text-eagle-foam">
                Categoría
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none focus:border-eagle-gold/50"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-bold text-eagle-foam">
                Colección / diseño
                <input
                  value={form.collection}
                  onChange={(event) =>
                    updateField("collection", event.target.value)
                  }
                  placeholder="Rosas, Urban Basic, Eagle..."
                  className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                />
              </label>

              <label className="block text-sm font-bold text-eagle-foam">
                Estado
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as ProductStatus)
                  }
                  className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none focus:border-eagle-gold/50"
                >
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="disabled">Desactivado</option>
                </select>
              </label>

              <label className="block text-sm font-bold text-eagle-foam sm:col-span-2">
                Descripción corta
                <input
                  value={form.shortDescription}
                  onChange={(event) =>
                    updateField("shortDescription", event.target.value)
                  }
                  placeholder="Camiseta oversize con diseño floral urbano."
                  className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                />
              </label>

              <label className="block text-sm font-bold text-eagle-foam sm:col-span-2">
                Descripción larga
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  rows={4}
                  placeholder="Descripción completa del producto..."
                  className="mt-2 w-full resize-none rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                />
              </label>

              <label className="block text-sm font-bold text-eagle-foam">
                Tags
                <input
                  value={form.tags.join(", ")}
                  onChange={(event) =>
                    updateField(
                      "tags",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="rosas, oversize, streetwear"
                  className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-4 py-3 text-sm font-bold text-eagle-foam">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    updateField("featured", event.target.checked)
                  }
                  className="h-4 w-4 accent-eagle-gold"
                />
                Producto destacado
              </label>
            </div>

            <div className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/55 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-eagle-foam">
                    Variantes
                  </h3>

                  <p className="mt-1 text-xs text-eagle-sand/55">
                    Cada variante representa color + talla + precio + stock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 rounded-2xl bg-eagle-gold px-4 py-2 text-xs font-bold text-eagle-night transition hover:bg-eagle-foam"
                >
                  <Plus size={15} />
                  Variante
                </button>
              </div>

              <div className="space-y-3">
                {form.variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="grid gap-3 rounded-2xl border border-eagle-mist/20 bg-eagle-night/60 p-3 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]"
                  >
                    <input
                      value={variant.colorName}
                      onChange={(event) =>
                        updateVariant(index, "colorName", event.target.value)
                      }
                      placeholder="Color"
                      className="rounded-xl border border-eagle-mist/20 bg-eagle-deep px-3 py-2 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40"
                    />

                    <input
                      type="color"
                      value={variant.colorHex}
                      onChange={(event) =>
                        updateVariant(index, "colorHex", event.target.value)
                      }
                      className="h-10 w-full rounded-xl border border-eagle-mist/20 bg-eagle-deep p-1"
                    />

                    <input
                      value={variant.size}
                      onChange={(event) =>
                        updateVariant(index, "size", event.target.value)
                      }
                      placeholder="Talla"
                      className="rounded-xl border border-eagle-mist/20 bg-eagle-deep px-3 py-2 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40"
                    />

                    <input
                      type="number"
                      value={variant.price}
                      onChange={(event) =>
                        updateVariant(index, "price", Number(event.target.value))
                      }
                      placeholder="Precio"
                      className="rounded-xl border border-eagle-mist/20 bg-eagle-deep px-3 py-2 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40"
                    />

                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(index, "stock", Number(event.target.value))
                      }
                      placeholder="Stock"
                      className="rounded-xl border border-eagle-mist/20 bg-eagle-deep px-3 py-2 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40"
                    />

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      disabled={form.variants.length === 1}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                    </button>

                    <input
                      value={variant.sku}
                      onChange={(event) =>
                        updateVariant(index, "sku", event.target.value)
                      }
                      placeholder="SKU automático si lo dejas vacío"
                      className="rounded-xl border border-eagle-mist/20 bg-eagle-deep px-3 py-2 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 md:col-span-6"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-5 py-3 text-sm font-bold text-eagle-sand transition hover:text-eagle-foam"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-eagle-gold px-5 py-3 text-sm font-bold text-eagle-night shadow-lg shadow-eagle-gold/20 transition hover:-translate-y-0.5 hover:bg-eagle-foam"
          >
            <CheckCircle2 size={18} />
            Guardar producto
          </button>
        </div>
      </div>
    </div>
  );
}