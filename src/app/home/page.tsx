import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Home() {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="min-w-[280px] md:min-w-[600px] max-w-4xl w-full flex flex-col items-center justify-center">
        <div className="mb-8 text-2xl font-bold">{t("title")}</div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Link href="/about" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer w-full theme-toggle-transition hover:shadow-md hover:scale-105"
            >
              {t("about")}
            </Button>
          </Link>
          <Link href="/blog" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer w-full theme-toggle-transition hover:shadow-md hover:scale-105"
            >
              Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
