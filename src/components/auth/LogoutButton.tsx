"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations();

  const handleLogout = async () => {
    await signOut({ redirect: "/login" });
  };

  return (
    <Button variant="outline" className="cursor-pointer" onClick={handleLogout}>
      {t("logoutButton")}
    </Button>
  );
}
