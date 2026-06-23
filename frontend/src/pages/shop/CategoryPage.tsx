import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../../components/product/ProductCard";
import { useStore } from "../../context/StoreContext";
import type { ProductColor, ProductSubcategory } from "../../types/store";

type FilterSubcategory = ProductSubcategory | "pantalones";
type SouvenirFilter = "recuadros" | "tazas" | "bordados";
type FilterCategory = FilterSubcategory | SouvenirFilter;

const SUBCATEGORIES: FilterSubcategory[] = [
  "camisetas",
  "gorras",
  "bolsos",
  "pantalones",
  "bisuteria",
  "joyas",
];

const SOUVENIR_CATEGORIES: SouvenirFilter[] = [
  "recuadros",
  "tazas",
  "bordados",
];

const FILTER_DETAILS: Record<FilterSubcategory, string[]> = {
  camisetas: ["oversize", "basica", "grafica", "polo"],
  gorras: ["snapback", "trucker", "dadCap", "bordada"],
  bolsos: ["tote", "mochila", "crossbody", "mini"],
  pantalones: ["baggy", "slim", "cargo", "recto"],
  bisuteria: ["minimal", "artesanal", "dorada", "plateada"],
  joyas: ["pulseras", "collares", "aretes", "anillos"],
};

const SOUVENIR_DETAILS: Record<SouvenirFilter, string[]> = {
  recuadros: ["canvas", "poster", "lamina", "marco"],
  tazas: ["ceramica", "travelMug", "termica", "ilustrada"],
  bordados: ["parche", "textil", "artesanal", "personalizado"],
};

const SOUVENIR_CATEGORY_MATCH: Record<SouvenirFilter, string[]> = {
  recuadros: ["art", "canvas", "poster", "recuadro", "cuadro", "lamina", "marco"],
  tazas: ["taza", "mug", "ceramica", "termica"],
  bordados: ["bordado", "embroidered", "parche", "textil", "woven"],
};

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

const getProductPrice = (product: unknown) => {
  const item = product as Record<string, unknown>;
  const value = item.priceUsd ?? item.price ?? item.precio;
  const numericValue =
    typeof value === "string"
      ? Number(value.replace("$", "").replace(",", "."))
      : Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getProductSizes = (product: unknown) => {
  const item = product as Record<string, unknown>;
  return Array.isArray(item.sizes)
    ? item.sizes.map((size) => String(size).toLowerCase())
    : [];
};

const getSearchText = (product: unknown) => {
  const item = product as Record<string, unknown>;

  return [
    item.name,
    item.description,
    item.story,
    item.category,
    item.subcategory,
    item.concept,
    item.color,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export function CategoryPage() {
  const { t } = useTranslation();
  const { category } = useParams();
  const { catalog } = useStore();
  const productsRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState<FilterCategory | null>(null);
  const [hovered, setHovered] = useState<FilterCategory | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    FilterCategory[]
  >([]);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [priceQuery, setPriceQuery] = useState("");
  const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routeCategory = category ?? "men";
  const isSouvenirs = routeCategory === "souvenirs";
  const filterCategories: FilterCategory[] = isSouvenirs
    ? SOUVENIR_CATEGORIES
    : SUBCATEGORIES;

  const routeCatalog = useMemo(() => {
    return catalog.filter((product) => {
      if (
        routeCategory === "men" ||
        routeCategory === "women" ||
        routeCategory === "souvenirs"
      ) {
        return (
          (product.collection ?? product.gender) === routeCategory ||
          product.category === routeCategory
        );
      }

      return product.category === routeCategory;
    });
  }, [catalog, routeCategory]);

  const quickPrices = useMemo(() => {
    return Array.from(
      new Set(routeCatalog.map((product) => Math.round(getProductPrice(product)))),
    )
      .filter((price) => price > 0)
      .sort((a, b) => a - b)
      .slice(0, 6);
  }, [routeCatalog]);

  const filtered = useMemo(() => {
    return routeCatalog.filter((product) => {
      const productSubcategory = String(product.subcategory ?? "");
      const matchesSubcategory =
        selectedSubcategories.length === 0 ||
        selectedSubcategories.some((subcategory) => {
          if (isSouvenirs && subcategory in SOUVENIR_CATEGORY_MATCH) {
            const text = getSearchText(product);
            return SOUVENIR_CATEGORY_MATCH[subcategory as SouvenirFilter].some(
              (keyword) => text.includes(keyword),
            );
          }

          return subcategory === productSubcategory;
        });

      const matchesColor =
        !isSouvenirs && selectedColor ? product.color === selectedColor : true;
      const productSizes = getProductSizes(product);
      const matchesSize = !isSouvenirs && selectedSize
        ? productSizes.length === 0 ||
          productSizes.includes(selectedSize.toLowerCase())
        : true;

      const productPrice = getProductPrice(product);
      const searchedPrice = Number(priceQuery);
      const matchesPrice =
        priceQuery.trim() === "" ||
        (Number.isFinite(searchedPrice) &&
          Math.round(productPrice) === Math.round(searchedPrice));

      const text = getSearchText(product);
      const matchesDetail =
        selectedDetails.length === 0 ||
        selectedDetails.some((detail) =>
          text.includes(t(`shop.filterDetails.${detail}`).toLowerCase()),
        ) ||
        selectedDetails.some((detail) => text.includes(detail.toLowerCase()));

      return (
        matchesSubcategory &&
        matchesColor &&
        matchesSize &&
        matchesPrice &&
        matchesDetail
      );
    });
  }, [
    routeCatalog,
    selectedSubcategories,
    selectedColor,
    selectedSize,
    priceQuery,
    selectedDetails,
    isSouvenirs,
    t,
  ]);

  const scrollToProducts = () => {
    setTimeout(() => {
      productsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const getDetails = (subcategory: FilterCategory) => {
    if (subcategory in SOUVENIR_DETAILS) {
      return SOUVENIR_DETAILS[subcategory as SouvenirFilter];
    }

    return FILTER_DETAILS[subcategory as FilterSubcategory];
  };

  const getCategoryLabel = (subcategory: FilterCategory) => {
    const namespace = isSouvenirs ? "shop.souvenirFilters" : "shop.subcategories";
    return t(`${namespace}.${subcategory}`);
  };

  const toggleSubcategory = (subcategory: FilterCategory) => {
    setSelectedSubcategories((current) => {
      const next = current.includes(subcategory)
        ? current.filter((item) => item !== subcategory)
        : [...current, subcategory];

      if (!next.includes(subcategory)) {
        setSelectedDetails((details) =>
          details.filter((detail) => !getDetails(subcategory).includes(detail)),
        );
      }

      return next;
    });
    setExpanded((current) => (current === subcategory ? null : subcategory));
    scrollToProducts();
  };

  const toggleDetail = (subcategory: FilterCategory, detail: string) => {
    setSelectedSubcategories((current) =>
      current.includes(subcategory) ? current : [...current, subcategory],
    );
    setSelectedDetails((current) =>
      current.includes(detail)
        ? current.filter((item) => item !== detail)
        : [...current, detail],
    );
    setExpanded(subcategory);
    scrollToProducts();
  };

  const handlePriceSearch = (value: string) => {
    setPriceQuery(value.replace(/[^\d.]/g, ""));
    scrollToProducts();
  };

  const handleFilterMouseEnter = (subcategory: FilterCategory) => {
    if (expanded) {
      return;
    }

    if (hoverCloseTimeout.current) {
      clearTimeout(hoverCloseTimeout.current);
    }

    setHovered(subcategory);
  };

  const handleFilterMouseLeave = () => {
    if (expanded) {
      return;
    }

    hoverCloseTimeout.current = setTimeout(() => {
      setHovered(null);
    }, 220);
  };

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setSelectedDetails([]);
    setSelectedColor(null);
    setSelectedSize(null);
    setPriceQuery("");
    setExpanded(null);
    setHovered(null);
    scrollToProducts();
  };

  const chips = [
    ...selectedSubcategories.map((subcategory) => ({
      id: `sub-${subcategory}`,
      label: getCategoryLabel(subcategory),
      remove: () => toggleSubcategory(subcategory),
    })),
    ...selectedDetails.map((detail) => ({
      id: `detail-${detail}`,
      label: t(`shop.filterDetails.${detail}`),
      remove: () =>
        setSelectedDetails((current) =>
          current.filter((item) => item !== detail),
        ),
    })),
    ...(selectedColor
      ? [
          {
            id: `color-${selectedColor}`,
            label: t(`shop.colors.${selectedColor}`, selectedColor),
            remove: () => setSelectedColor(null),
          },
        ]
      : []),
    ...(selectedSize
      ? [
          {
            id: `size-${selectedSize}`,
            label: selectedSize,
            remove: () => setSelectedSize(null),
          },
        ]
      : []),
    ...(priceQuery
      ? [
          {
            id: "price",
            label: `$${priceQuery}`,
            remove: () => setPriceQuery(""),
          },
        ]
      : []),
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-xl shadow-black/5 lg:sticky lg:top-24">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent">
              <SlidersHorizontal size={15} />
              {t("shop.filters.eyebrow")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-black text-neutral-950">
              {t("shop.filters.title")}
            </h2>
          </div>

          {chips.length > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-accent"
              aria-label={t("shop.filters.clear")}
            >
              <X size={17} />
            </button>
          ) : null}
        </div>

        <div className="space-y-5">
          <section>
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
              {t("shop.filters.category")}
            </h3>

            <div className="space-y-2">
              {filterCategories.map((subcategory) => {
                const isOpen = expanded === subcategory || hovered === subcategory;
                const isSelected = selectedSubcategories.includes(subcategory);
                const details = getDetails(subcategory);

                return (
                  <div
                    key={subcategory}
                    onMouseEnter={() => handleFilterMouseEnter(subcategory)}
                    onMouseLeave={handleFilterMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubcategory(subcategory)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-black transition ${
                        isSelected
                          ? "bg-accent/10 text-neutral-950 ring-1 ring-accent/30"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                      }`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isSelected ? "bg-accent" : "bg-neutral-300"
                          }`}
                        />
                        {getCategoryLabel(subcategory)}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <div
                      className={`ml-5 overflow-hidden border-l border-neutral-200 pl-3 transition-all duration-300 ease-out ${
                        isOpen
                          ? "mt-2 max-h-96 translate-y-0 py-1 opacity-100"
                          : "mt-0 max-h-0 -translate-y-1 py-0 opacity-0"
                      }`}
                    >
                        <div className="space-y-1.5">
                          {details.map((detail) => (
                            <button
                              key={detail}
                              type="button"
                              onClick={() => toggleDetail(subcategory, detail)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-black transition ${
                                selectedDetails.includes(detail)
                                  ? "bg-neutral-950 text-white"
                                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                              }`}
                            >
                              <span>{t(`shop.filterDetails.${detail}`)}</span>
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  selectedDetails.includes(detail)
                                    ? "bg-white"
                                    : "bg-neutral-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
              {t("shop.filters.price")}
            </h3>
            <label className="relative block">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                inputMode="decimal"
                value={priceQuery}
                onChange={(event) => handlePriceSearch(event.target.value)}
                placeholder={t("shop.filters.pricePlaceholder")}
                className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-11 py-3 text-sm font-bold text-neutral-950 outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickPrices.map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => handlePriceSearch(String(price))}
                  className={`rounded-full px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                    priceQuery === String(price)
                      ? "bg-primary text-neutral-950"
                      : "bg-primary/20 text-neutral-700 hover:bg-primary"
                  }`}
                >
                  ${price}
                </button>
              ))}
            </div>
          </section>

          {!isSouvenirs ? (
            <>
              <section>
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
                  {t("shop.filters.size")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize((current) =>
                          current === size ? null : size,
                        );
                        scrollToProducts();
                      }}
                      className={`rounded-2xl px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                        selectedSize === size
                          ? "bg-secondary text-white shadow-lg shadow-secondary/20"
                          : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-secondary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
                  {t("shop.filters.color")}
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setSelectedColor((current) =>
                          current === color.value ? null : color.value,
                        );
                        scrollToProducts();
                      }}
                      className={`h-10 w-10 rounded-full border-2 transition hover:scale-105 ${
                        selectedColor === color.value
                          ? "border-neutral-950 shadow-lg shadow-black/25 ring-2 ring-neutral-950/10"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={t(`shop.colors.${color.value}`, color.label)}
                      aria-label={t(`shop.colors.${color.value}`, color.label)}
                    />
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </aside>

      <section ref={productsRef} className="scroll-mt-28 space-y-6">
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-neutral-950">
              {filtered.length}{" "}
              <span className="text-neutral-500">
                {filtered.length === 1 ? t("shop.product") : t("shop.products")}
              </span>
            </p>

            <p className="text-sm text-neutral-500">
              {priceQuery
                ? t("shop.filters.priceResult", { price: priceQuery })
                : t("shop.filters.noPrice")}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {chips.length === 0 ? (
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-500">
                {t("shop.filters.emptySelection")}
              </span>
            ) : (
              chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={chip.remove}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-accent"
                >
                  {chip.label}
                  <X size={14} />
                </button>
              ))
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-neutral-700">
              {t("shop.empty.title")}
            </p>
            <p className="mt-2 text-sm text-neutral-500">{t("shop.empty.text")}</p>
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
