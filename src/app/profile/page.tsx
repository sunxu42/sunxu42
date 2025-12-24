import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { useTranslations } from "next-intl";
import { ProfileUpdateForm } from "./components/ProfileUpdateForm";

export default async function ProfilePage() {
  // 服务端校验token（页面刷新时执行）
  const session = await getServerSession();

  // token无效，重定向到登录页
  if (!session) {
    return redirect("/login");
  }

  const t = useTranslations();
  const user = session.user;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="min-w-[280px] md:min-w-[600px] max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
        <ProfileUpdateForm user={user} />
      </div>
    </div>
  );
}
