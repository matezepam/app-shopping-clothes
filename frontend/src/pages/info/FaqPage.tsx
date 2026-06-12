import { useTranslation } from "react-i18next";

export function FaqPage() {
    const { t } = useTranslation();

    const questions = [
        {
            question: t("faqPage.q1"),
            answer: t("faqPage.a1"),
        },
        {
            question: t("faqPage.q2"),
            answer: t("faqPage.a2"),
        },
        {
            question: t("faqPage.q3"),
            answer: t("faqPage.a3"),
        },
        {
            question: t("faqPage.q4"),
            answer: t("faqPage.a4"),
        },
        {
            question: t("faqPage.q5"),
            answer: t("faqPage.a5"),
        },
    ];

    return (
        <main className="bg-background">
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-10 text-center">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                            Sprint
                        </p>
                        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                            {t("faqPage.title")}
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            {t("faqPage.subtitle")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {questions.map((item) => (
                            <div
                                key={item.question}
                                className="rounded-3xl border bg-white p-6 shadow-sm"
                            >
                                <h2 className="font-display text-xl font-bold text-foreground">
                                    {item.question}
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}