import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

export function ContactPage() {
    const { t } = useTranslation();
    const [sent, setSent] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSent(true);
    }

    return (
        <main className="bg-background">
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-10">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                            Sprint
                        </p>

                        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                            {t("contactPage.title")}
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            {t("contactPage.subtitle")}
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                        <div className="space-y-4">
                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("contactPage.emailTitle")}
                                </p>

                                <p className="mt-3 text-lg font-semibold text-foreground">
                                    contacto@sprint.com
                                </p>
                            </div>

                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("contactPage.phoneTitle")}
                                </p>

                                <p className="mt-3 text-lg font-semibold text-foreground">
                                    0939051525
                                </p>
                            </div>

                            <div className="rounded-3xl border bg-white p-6 shadow-sm">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                                    {t("contactPage.scheduleTitle")}
                                </p>

                                <p className="mt-3 text-lg font-semibold text-foreground">
                                    {t("contactPage.schedule")}
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"
                        >
                            <div className="grid gap-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t("contactPage.name")}
                                    </label>

                                    <input
                                        required
                                        type="text"
                                        className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t("contactPage.email")}
                                    </label>

                                    <input
                                        required
                                        type="email"
                                        className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t("contactPage.subject")}
                                    </label>

                                    <input
                                        required
                                        type="text"
                                        className="w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        {t("contactPage.message")}
                                    </label>

                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full resize-none rounded-2xl border px-4 py-3 outline-none transition focus:border-primary"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
                                >
                                    {t("contactPage.submit")}
                                </button>

                                {sent && (
                                    <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                                        {t("contactPage.success")}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
