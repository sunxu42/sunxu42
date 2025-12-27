"use client";

import { useRouter, useSearchParams } from "next/navigation";
import loginAnimation from "@/assets/animations/login.json";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import type { LottieRefCurrentProps } from "lottie-react";
import Lottie from "lottie-react";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

type LoginResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof LoginInput, string>>;
};

function useLoginState() {
  const [pendingResult, setPendingResult] = useState<LoginResult | null>(null);

  const setPending = (result: LoginResult) => {
    setPendingResult(result);
  };

  const reset = () => {
    setPendingResult(null);
  };

  return { pendingResult, setPending, reset };
}

function useDelayedUpdate<T>(value: T, delay: number, onUpdate: (value: T) => void) {
  useEffect(() => {
    if (value !== null) {
      const timer = setTimeout(() => {
        onUpdate(value);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay, onUpdate]);
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("login");
  const { data: session, status } = useSession();

  const { pendingResult, setPending, reset } = useLoginState();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/home");
    }
  }, [status, session, router]);

  const errorParam = searchParams.get("error");
  const urlErrorProcessedRef = useRef(false);

  useEffect(() => {
    if (errorParam && !urlErrorProcessedRef.current) {
      const errorMessage =
        errorParam === "CredentialsSignin"
          ? t("errors.invalidCredentials")
          : t("errors.loginFailed");
      requestAnimationFrame(() => setError(errorMessage));
      urlErrorProcessedRef.current = true;
    }
  }, [errorParam, t]);

  useDelayedUpdate(pendingResult, 3000, result => {
    lottieRef.current?.stop();
    setIsLoading(false);
    if (result?.success) {
      router.push("/home");
    } else if (result?.error) {
      setError(result.error);
    } else if (result?.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }
    reset();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const loginSchemaWithI18n = loginSchema.extend({
      email: z.email(t("errors.invalidEmail")),
      password: z.string().min(6, t("errors.passwordTooShort")),
    });

    try {
      loginSchemaWithI18n.parse(formData);

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setPending({ success: false, error: t("errors.invalidCredentials") });
      } else {
        setPending({ success: true });
      }
      lottieRef.current?.play();
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginInput, string>> = {};
        err.issues.forEach(issue => {
          const field = issue.path[0] as keyof LoginInput;
          errors[field] = issue.message;
        });
        setFieldErrors(errors);
        setIsLoading(false);
      } else {
        const errorMessage = err instanceof Error ? err.message : t("errors.unknownError");
        setPending({ success: false, error: errorMessage });
        lottieRef.current?.play();
      }
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/guest-login", {
        method: "POST",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || t("errors.loginFailed"));
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: data.user.email,
        password: data.user.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("errors.invalidCredentials"));
        setIsLoading(false);
      } else {
        setPending({ success: true });
        lottieRef.current?.play();
      }
    } catch (err) {
      setError(t("errors.unknownError"));
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginInput, value: string) => {
    setError("");
    setFieldErrors(prev => ({ ...prev, [field]: "" }));
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto p-4">
      <div className="w-full md:w-1/2 items-center justify-center hidden laptop:flex">
        <Lottie
          lottieRef={lottieRef}
          autoplay={false}
          animationData={loginAnimation}
          loop={false}
          className="w-full max-w-md"
        />
      </div>
      <div className="min-w-[280px] md:min-w-[480px] max-w-[480px]">
        <Card className="w-full !bg-white !text-black !border-gray-200 animate-transition">
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div
                className={`animate-transition bg-red-100 rounded-md ${
                  error ? "m-h-20 opacity-100 p-2" : "h-0 opacity-0"
                }`}
              >
                <div className="text-red-700 text-sm">{error}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("email")}
                  value={formData.email}
                  onChange={e => handleInputChange("email", e.target.value)}
                  className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
                />
                <div
                  className={`animate-transition ${
                    fieldErrors.email ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("password")}
                  value={formData.password}
                  onChange={e => handleInputChange("password", e.target.value)}
                  className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.password ? "border-red-500" : "border-gray-300"}`}
                />
                <div
                  className={`animate-transition ${
                    fieldErrors.password ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-red-500 text-sm">{fieldErrors.password}</p>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full animate-transition cursor-pointer !bg-black !text-white"
                loading={isLoading}
                disabled={isLoading}
              >
                {t("loginButton")}
              </Button>
              {/* <div className="flex justify-around gap-4">
                <Button
                  type="submit"
                  className="w-full animate-transition cursor-pointer !bg-black !text-white"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {t("loginButton")}
                </Button>
                <Button
                  type="button"
                  className="w-full animate-transition cursor-pointer !bg-black !text-white"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  {t("guestLoginButton")}
                </Button>
              </div> */}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
