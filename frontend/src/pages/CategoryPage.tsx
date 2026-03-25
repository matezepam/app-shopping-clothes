import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { categorySections } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import type { Category } from "../types/store";

const ALL_CATEGORIES: Category[] = [
  "men",
  "women",
  "souvenirs",
  "shirts",
  "hoodies",
  "caps",
  "art",
];

function isSection(id: string): id is "men" | "women" | "souvenirs" {
  return id === "men" || id === "women" || id === "souvenirs";
}

export function CategoryPage() {
  const { category = "" } = useParams();
  const { t } = useTranslation();
  const { catalog } = useStore();

  const filtered = useMemo(() => {
    if (isSection(category)) {
      const sec = categorySections.find((s) => s.id === category);
      if (!sec) return [];
      return catalog.filter((p) =>
        (sec.categories as readonly Category[]).includes(p.category),
      );
    }
    if (ALL_CATEGORIES.includes(category as Category)) {
      return catalog.filter((p) => p.category === category);
    }
    return [];
  }, [catalog, category]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category, filtered]);

  const title = isSection(category)
    ? t(`categories.${category}`)
    : ALL_CATEGORIES.includes(category as Category)
      ? t(`categories.${category as Category}`)
      : t("nav.home");

  const known =
    isSection(category) ||
    ALL_CATEGORIES.includes(category as Category);

  if (!category || !known) {
    return (
      <p className="text-eagle-sand/80">{t("common.error")}</p>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="text-eagle-sand/80">{t("history.empty")}</p>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-eagle-foam">
        {title}
      </h1>
      <p className="mt-2 max-w-prose text-eagle-sand/80">
        {t("home.subtitle")}
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} id={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
