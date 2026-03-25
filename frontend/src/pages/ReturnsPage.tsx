import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export function ReturnsPage() {
  const { t } = useTranslation();
  const { user, returns } = useStore();

  if (!user) {
    return (
      <p className="text-eagle-sand/80">
        <Link to="/login" className="text-eagle-gold underline">
          {t("nav.login")}
        </Link>
      </p>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-eagle-foam">
        {t("returns.title")}
      </h1>
      {returns.length === 0 ? (
        <p className="mt-6 text-eagle-sand/80">{t("returns.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {returns.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/50 p-4 text-sm"
            >
              <p className="font-mono text-eagle-sand/60">{r.id.slice(0, 8)}…</p>
              <p className="mt-1 text-eagle-foam">
                {t("returns.qty")}: {r.quantity} · {r.productId}
              </p>
              <p className="text-eagle-sand/80">
                {t("returns.status")}:{" "}
                <span className="text-eagle-gold">{r.status}</span>
              </p>
              <p className="mt-1 text-eagle-sand/70">{r.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
