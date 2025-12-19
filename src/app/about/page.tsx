import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="min-w-[280px] md:min-w-[600px] max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("about.title")}</h1>
        <div className="space-y-4">
          <p className="text-lg">{t("about.intro")}</p>
          <p>{t("about.focus")}</p>
          <p>{t("about.purpose")}</p>
        </div>
      </div>
    </div>
  );
}
