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
    <div className="relative group">
      <NavLink
        to={`/category/${sectionId}`}
        className={({ isActive }) =>
          [
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            isActive
              ? "bg-white text-[#0a0f1a]"
              : "text-white/70 hover:bg-white/10 hover:text-white",
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

      <div className="absolute left-0 top-full h-3 w-56" />
      <div className="pointer-events-none absolute left-0 top-[calc(100%+0.5rem)] z-50 w-56 origin-top-left translate-y-1 scale-95 rounded-2xl border border-white/10 bg-[#0a0f1a]/95 p-2 text-sm text-white opacity-0 shadow-xl shadow-black/25 backdrop-blur-md transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:animate-fade-up">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {t(`nav.${sectionId}`)}
        </p>
        <div className="grid gap-1">
          {items.map((cat) => (
            <NavLink
              key={cat}
              to={`/category/${cat}`}
              className={({ isActive }) =>
                [
                  "rounded-xl px-3 py-2 transition-colors",
                  isActive
                    ? "bg-white text-[#0a0f1a]"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
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



