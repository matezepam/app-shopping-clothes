import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { ProductCard } from "../../components/product/ProductCard";
import { useStore } from "../../context/StoreContext";
import type { ProductColor, ProductSubcategory } from "../../types/store";

const MALE_SUBCATEGORIES: ProductSubcategory[] = ["camisetas", "gorras", "bolsos"];
const FEMALE_SUBCATEGORIES: ProductSubcategory[] = ["camisetas", "gorras", "bolsos", "bisuteria", "joyas"];

const COLORS: { label: string; value: ProductColor; hex: string }[] = [
  { label: "Negro", value: "negro", hex: "#000000" },
  { label: "Blanco", value: "blanco", hex: "#FFFFFF" },
  { label: "Rojo", value: "rojo", hex: "#EF4444" },
  { label: "Azul", value: "azul", hex: "#3B82F6" },
  { label: "Verde", value: "verde", hex: "#22C55E" },
  { label: "Beige", value: "beige", hex: "#D4A574" },
  { label: "Gris", value: "gris", hex: "#9CA3AF" },
  { label: "Dorado", value: "dorado", hex: "#FBBF24" },
  { label: "Plateado", value: "plateado", hex: "#E5E7EB" },
  { label: "Rosa", value: "rosa", hex: "#EC4899" },
];

const SUBCATEGORY_LABELS: Record<ProductSubcategory, string> = {
  camisetas: "Camisetas",
  gorras: "Gorras",
  bolsos: "Bolsos",
  bisuteria: "Bisutería",
  joyas: "Joyas",
};

export function CategoryPage() {
  const { t } = useTranslation();
  const { catalog } = useStore();

  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedSubcategories, setSelectedSubcategories] = useState<ProductSubcategory[]>(["camisetas"]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);

  const availableSubcategories = gender === "male" ? MALE_SUBCATEGORIES : FEMALE_SUBCATEGORIES;

  const filtered = useMemo(() => {
    return catalog.filter((product) => {
      const matchesGender = product.gender === gender;
      const matchesSubcategory = selectedSubcategories.includes(product.subcategory);
      const matchesColor = selectedColor ? product.color === selectedColor : true;

      return matchesGender && matchesSubcategory && matchesColor;
    });
  }, [catalog, gender, selectedSubcategories, selectedColor]);

  const handleGenderChange = (newGender: "male" | "female") => {
    setGender(newGender);
    setSelectedSubcategories([newGender === "male" ? "camisetas" : "camisetas"]);
    setSelectedColor(null);
  };

  const toggleSubcategory = (sub: ProductSubcategory) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(sub)) {
        return prev.length === 1 ? prev : prev.filter((s) => s !== sub);
      }
      return [...prev, sub];
    });
  };

  const getUniqueColors = () => {
    const uniqueColors = new Set(
      filtered.map((p) => p.color)
    );
    return COLORS.filter((c) => uniqueColors.has(c.value));
  };

  return (
    <div className="space-y-8">
      {/* Gender Selector */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">
          Género
        </h2>
        <div className="flex gap-3 sm:gap-4">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => handleGenderChange(g)}
              className={`flex-1 rounded-2xl px-6 py-3 font-bold transition ${
                gender === g
                  ? "bg-accent text-white shadow-lg shadow-accent/25"
                  : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
              }`}
            >
              {g === "male" ? "👨 Hombre" : "👩 Mujer"}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories Selector */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <h2 className="mb-4 font-display text-lg font-bold text-foreground">
          Categoría
        </h2>
        <div className="flex flex-wrap gap-2">
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => toggleSubcategory(sub)}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                selectedSubcategories.includes(sub)
                  ? "bg-secondary text-white shadow-lg shadow-secondary/25"
                  : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
              }`}
            >
              {SUBCATEGORY_LABELS[sub]}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selector */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">
            Color
          </h2>
          {selectedColor && (
            <button
              onClick={() => setSelectedColor(null)}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-foreground transition hover:bg-white/20"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {getUniqueColors().map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value === selectedColor ? null : color.value)}
              className={`group flex flex-col items-center gap-2 transition ${
                selectedColor === color.value ? "scale-110" : ""
              }`}
              title={color.label}
            >
              <div
                className={`h-12 w-12 rounded-full border-2 transition ${
                  selectedColor === color.value
                    ? "border-white shadow-lg shadow-white/50"
                    : "border-white/30 hover:border-white/60"
                } ${color.hex === "#FFFFFF" ? "border-gray-300 bg-white" : ""}`}
                style={{
                  backgroundColor: color.hex,
                }}
              />
              <span className="text-xs font-semibold text-foreground/70 group-hover:text-foreground">
                {color.label}
              </span>
            </button>
          ))}
        </div>
        {getUniqueColors().length === 0 && (
          <p className="text-sm text-foreground/50">
            No hay colores disponibles en esta selección
          </p>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
        <p className="font-semibold text-foreground">
          {filtered.length}{" "}
          <span className="text-foreground/70">
            {filtered.length === 1 ? "producto" : "productos"}
          </span>
        </p>
        {selectedColor && (
          <p className="text-sm text-foreground/60">
            Filtrado por color: <span className="font-bold capitalize">{selectedColor}</span>
          </p>
        )}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-lg font-semibold text-foreground/70">
            No hay productos disponibles en esta selección
          </p>
          <p className="mt-2 text-sm text-foreground/50">
            Intenta cambiar los filtros
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}