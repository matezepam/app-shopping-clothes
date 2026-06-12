import { useTranslation } from "react-i18next";

export function TermsPage() {
    const { t } = useTranslation();

    return (
        <main className="bg-background">
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                            Sprint
                        </p>
                        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                            {t("termsPage.title")}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            {t("termsPage.subtitle")}
                        </p>
                    </div>

                    <div className="space-y-5">
                        <section className="rounded-3xl border bg-white p-6 shadow-sm">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                {t("termsPage.section1Title")}
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                {t("termsPage.section1Text")}
                            </p>
                        </section>

                        <section className="rounded-3xl border bg-white p-6 shadow-sm">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                {t("termsPage.section2Title")}
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                {t("termsPage.section2Text")}
                            </p>
                        </section>

                        <section className="rounded-3xl border bg-white p-6 shadow-sm">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                {t("termsPage.section3Title")}
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                {t("termsPage.section3Text")}
                            </p>
                        </section>

                        <section className="rounded-3xl border bg-white p-6 shadow-sm">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                {t("termsPage.section4Title")}
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                {t("termsPage.section4Text")}
                            </p>
                        </section>
                    </div>
                </div>
            </section>
        </main>
    );
}