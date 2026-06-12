import { useTranslation } from "react-i18next";

export function LocationPage() {
    const { t } = useTranslation();

    return (
        <main className="bg-background">
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                            Sprint
                        </p>

                        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                            {t("locationPage.title")}
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            {t("locationPage.subtitle")}
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
                        <div className="space-y-4">
                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("locationPage.addressTitle")}
                                </p>

                                <p className="mt-3 text-lg font-semibold text-foreground">
                                    {t("locationPage.address")}
                                </p>
                            </div>

                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("locationPage.phoneTitle")}
                                </p>

                                <a
                                    href="tel:+593939051525"
                                    className="mt-3 block text-lg font-semibold text-foreground transition hover:text-primary"
                                >
                                    0939051525
                                </a>
                            </div>

                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("locationPage.scheduleTitle")}
                                </p>

                                <p className="mt-3 text-lg font-semibold text-foreground">
                                    {t("locationPage.schedule")}
                                </p>
                            </div>

                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("locationPage.referenceTitle")}
                                </p>

                                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                    {t("locationPage.reference")}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                            <iframe
                                title="Ubicación de Sprint"
                                src="https://www.google.com/maps/embed?pb=!4v1781282837757!6m8!1m7!1sV9sOAn_kKjD7ciY-Rd2XnA!2m2!1d-0.2209111841177128!2d-78.51171394480617!3f219.47842379742525!4f-4.702372338456016!5f0.7820865974627469"
                                width="100%"
                                height="520"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="block w-full border-0"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}