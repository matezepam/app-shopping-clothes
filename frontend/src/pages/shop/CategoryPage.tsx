import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";
import { ProductCard } from "../../components/product/ProductCard";
import { useStore } from "../../context/StoreContext";
import type { ProductColor, ProductSubcategory } from "../../types/store";

type FilterSubcategory = ProductSubcategory | "pantalones";

const SUBCATEGORIES: FilterSubcategory[] = [
  "camisetas",
  "gorras",
  "bolsos",
  "pantalones",
  "bisuteria",
  "joyas",
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Oversize"];

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

const SUBCATEGORY_LABELS: Record<FilterSubcategory, string> = {
  camisetas: "Camisetas",
  gorras: "Gorras",
  bolsos: "Bolsos",
  pantalones: "Pantalones",
  bisuteria: "Bisutería",
  joyas: "Joyas",
};

const getProductPrice = (product: unknown) => {
  const item = product as Record<string, unknown>;

  const value =
    item.price ??
    item.finalPrice ??
    item.basePrice ??
    item.currentPrice ??
    item.salePrice ??
    item.discountPrice ??
    item.precio;

  const numericValue =
    typeof value === "string"
      ? Number(value.replace("$", "").replace(",", "."))
      : Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getProductSizes = (product: unknown) => {
  const item = product as Record<string, unknown>;

  if (Array.isArray(item.sizes)) {
    return item.sizes.map((size) => String(size).toLowerCase());
  }

  if (Array.isArray(item.tallas)) {
    return item.tallas.map((size) => String(size).toLowerCase());
  }

  if (item.size) {
    return [String(item.size).toLowerCase()];
  }

  if (item.talla) {
    return [String(item.talla).toLowerCase()];
  }

  return [];
};

export function CategoryPage() {
  const { t } = useTranslation();
  const { category } = useParams();
  const { catalog } = useStore();
  const productsRef = useRef<HTMLDivElement | null>(null);

  const [selectedSubcategories, setSelectedSubcategories] = useState<FilterSubcategory[]>([]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });

  const maxCatalogPrice = useMemo(() => {
    const prices = catalog.map((product) => getProductPrice(product));
    return Math.ceil(Math.max(...prices, 100));
  }, [catalog]);

  useEffect(() => {
    setPriceRange({ min: 0, max: maxCatalogPrice });
  }, [maxCatalogPrice]);

  const scrollToProducts = () => {
    setTimeout(() => {
      productsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const filtered = useMemo(() => {
    return catalog.filter((product) => {
      const item = product as unknown as Record<string, unknown>;
      const routeCategory = category ?? "men";
      const matchesRoute =
        routeCategory === "men" ||
        routeCategory === "women" ||
        routeCategory === "souvenirs"
          ? (product.collection ?? product.gender) === routeCategory ||
            product.category === routeCategory
          : product.category === routeCategory;

      const productSubcategory = String(item.subcategory ?? "");

      const matchesSubcategory =
        selectedSubcategories.length === 0 ||
        selectedSubcategories.includes(productSubcategory as FilterSubcategory);

      const matchesColor = selectedColor ? product.color === selectedColor : true;

      const productPrice = getProductPrice(product);

      const matchesPrice =
        productPrice >= priceRange.min && productPrice <= priceRange.max;

      const productSizes = getProductSizes(product);

      const matchesSize = selectedSize
        ? productSizes.length === 0 || productSizes.includes(selectedSize.toLowerCase())
        : true;

      return (
        matchesRoute &&
        matchesSubcategory &&
        matchesColor &&
        matchesPrice &&
        matchesSize
      );
    });
  }, [catalog, category, selectedSubcategories, selectedColor, selectedSize, priceRange]);

  const availableColors = useMemo(() => {
    const uniqueColors = new Set(catalog.map((product) => product.color));
    return COLORS.filter((color) => uniqueColors.has(color.value));
  }, [catalog]);

  const toggleSubcategory = (subcategory: FilterSubcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((item) => item !== subcategory)
        : [...prev, subcategory]
    );

    scrollToProducts();
  };

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor((prev) => (prev === color ? null : color));
    scrollToProducts();
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize((prev) => (prev === size ? null : size));
    scrollToProducts();
  };

  const handleMinPriceChange = (value: number) => {
    setPriceRange((prev) => ({
      min: Math.min(value, prev.max),
      max: prev.max,
    }));

    scrollToProducts();
  };

  const handleMaxPriceChange = (value: number) => {
    setPriceRange((prev) => ({
      min: prev.min,
      max: Math.max(value, prev.min),
    }));

    scrollToProducts();
  };

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setSelectedColor(null);
    setSelectedSize(null);
    setPriceRange({ min: 0, max: maxCatalogPrice });
    scrollToProducts();
  };

  const hasFilters =
    selectedSubcategories.length > 0 ||
    selectedColor ||
    selectedSize ||
    priceRange.min !== 0 ||
    priceRange.max !== maxCatalogPrice;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">
            {t("shop.filters.title")}
          </h2>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-foreground transition hover:bg-white/20"
            >
              <X size={14} />
              {t("shop.filters.clear")}
            </button>
          )}
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="mb-3 font-display text-base font-bold text-foreground">
              {t("shop.filters.category")}
            </h3>

            <div className="space-y-2">
              {SUBCATEGORIES.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => toggleSubcategory(subcategory)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    selectedSubcategories.includes(subcategory)
                      ? "bg-secondary text-white shadow-lg shadow-secondary/25"
                      : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                >
                  {t(`shop.subcategories.${subcategory}`, SUBCATEGORY_LABELS[subcategory])}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-display text-base font-bold text-foreground">
              {t("shop.filters.price")}
            </h3>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between text-sm font-bold text-foreground">
                <span>${priceRange.min}</span>
                <span>${priceRange.max}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-foreground/60">
                    {t("shop.filters.minPrice")}
                  </p>

                  <input
                    type="range"
                    min="0"
                    max={maxCatalogPrice}
                    value={priceRange.min}
                    onChange={(event) => handleMinPriceChange(Number(event.target.value))}
                    className="w-full accent-current"
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-foreground/60">
                    {t("shop.filters.maxPrice")}
                  </p>

                  <input
                    type="range"
                    min="0"
                    max={maxCatalogPrice}
                    value={priceRange.max}
                    onChange={(event) => handleMaxPriceChange(Number(event.target.value))}
                    className="w-full accent-current"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-display text-base font-bold text-foreground">
              {t("shop.filters.size")}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`rounded-2xl px-3 py-2 text-sm font-bold transition ${
                    selectedSize === size
                      ? "bg-accent text-white shadow-lg shadow-accent/25"
                      : "border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-display text-base font-bold text-foreground">
              {t("shop.filters.color")}
            </h3>

            <div className="grid grid-cols-5 gap-3">
              {availableColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`h-10 w-10 rounded-full border-2 transition ${
                    selectedColor === color.value
                      ? "scale-110 border-white shadow-lg shadow-white/50"
                      : "border-white/30 hover:border-white/60"
                  } ${color.hex === "#FFFFFF" ? "border-gray-300 bg-white" : ""}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
            </div>
          </section>
        </div>
      </aside>

      <section ref={productsRef} className="scroll-mt-28 space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-foreground">
            {filtered.length}{" "}
            <span className="text-foreground/70">
              {filtered.length === 1 ? t("shop.product") : t("shop.products")}
            </span>
          </p>

          <p className="text-sm text-foreground/60">
            {t("shop.filters.priceFrom")}{" "}
            <span className="font-bold text-foreground">${priceRange.min}</span>{" "}
            {t("shop.filters.priceTo")}{" "}
            <span className="font-bold text-foreground">${priceRange.max}</span>
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-lg font-semibold text-foreground/70">
              {t("shop.empty.title")}
            </p>
            <p className="mt-2 text-sm text-foreground/50">
              {t("shop.empty.text")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
