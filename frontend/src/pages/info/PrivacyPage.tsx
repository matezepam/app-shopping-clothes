import { useTranslation } from "react-i18next";

export function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-eagle-foam">
        {t("privacy.title")}
      </h1>
      <div className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-6">
        <p className="text-eagle-sand/85 leading-relaxed">{t("privacy.body")}</p>
      </div>
    </div>
  );
}

