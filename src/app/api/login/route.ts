import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils";
import { login } from "@/server/api/auth/login";
import { ErrorCode, LoginRequestSchema, LoginResponse, type ApiResponse } from "@/types/index";

// 辅助函数：设置认证cookies
function setAuthCookies(response: NextResponse, token: string, refreshToken: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 4 * 60 * 60, // 4小时
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7天
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();

    // 使用zod验证请求数据
    const { email, password } = LoginRequestSchema.parse(requestBody);

    // 获取客户端信息
    const clientIp =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const clientInfo = req.headers.get("user-agent") || "unknown";

    // 调用server层的登录逻辑
    const loginResponse = await login(email, password, clientInfo, clientIp);

    // 创建统一API响应
    const successResponse: ApiResponse<LoginResponse> = {
      success: true,
      message: "登录成功",
      data: loginResponse,
      code: ErrorCode.SUCCESS,
    };

    // 创建响应
    const response = NextResponse.json(successResponse, { status: 200 });

    // 设置token和refresh token到cookie
    setAuthCookies(response, loginResponse.data.token, loginResponse.data.refresh_token);

    return response;
  } catch (error: unknown) {
    return handleApiError(error, "登录");
  }
}
