import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Category } from "../types/store";
import { categorySections } from "../data/products";

type SectionId = "men" | "women" | "souvenirs";

export function SectionDropdown({ sectionId }: { sectionId: SectionId }) {
  const { t } = useTranslation();
  const section = categorySections.find((s) => s.id === sectionId);
  const items = (section?.categories ?? []) as readonly Category[];

  return (
    <div className="relative group pb-2">
      <NavLink
        to={`/category/${sectionId}`}
        className={({ isActive }) =>
          [
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
            isActive
              ? "bg-eagle-red/15 text-eagle-red"
              : "text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam",
          ].join(" ")
        }
      >
        {t(`nav.${sectionId}`)}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          className="opacity-70 transition group-hover:opacity-100"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </NavLink>

      <div className="pointer-events-none absolute left-0 top-full z-50 w-56 origin-top-left rounded-2xl border border-eagle-mist/40 bg-eagle-deep/95 p-2 text-sm shadow-xl shadow-black/25 backdrop-blur-md opacity-0 translate-y-1 scale-95 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:animate-fade-up">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-eagle-sand/60">
          {t(`nav.${sectionId}`)}
        </p>
        <div className="grid gap-1">
          {items.map((cat) => (
            <NavLink
              key={cat}
              to={`/category/${cat}`}
              className={({ isActive }) =>
                [
                  "rounded-xl px-3 py-2 transition",
                  isActive
                    ? "bg-eagle-red/20 text-eagle-red"
                    : "text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam",
                ].join(" ")
              }
            >
              {t(`categories.${cat}`)}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

