import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/utils";
import { refreshToken } from "@/server/api/auth/refreshToken";
import { ErrorCode, type ApiResponse } from "@/types/index";

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
    // 从cookie获取refresh token
    const refreshTokenValue = req.cookies.get("refresh_token")?.value;
    if (!refreshTokenValue) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少refresh token",
          code: ErrorCode.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    // 获取客户端信息
    const clientIp =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const clientInfo = req.headers.get("user-agent") || "unknown";

    // 调用server层的刷新逻辑
    const refreshTokenResponse = await refreshToken(refreshTokenValue, clientInfo, clientIp);

    // 创建统一API响应
    const successResponse: ApiResponse<typeof refreshTokenResponse> = {
      success: true,
      message: "Token刷新成功",
      data: refreshTokenResponse,
      code: ErrorCode.SUCCESS,
    };

    // 创建响应
    const response = NextResponse.json(successResponse, { status: 200 });

    // 设置token和refresh token到cookie
    setAuthCookies(response, refreshTokenResponse.token, refreshTokenResponse.refresh_token);

    return response;
  } catch (error: unknown) {
    return handleApiError(error, "刷新令牌");
  }
}
