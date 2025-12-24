import { NextRequest, NextResponse } from "next/server";
import { refreshToken } from "@/server/api/auth/refreshToken";
import { ErrorCode, type ApiResponse } from "@/types/index";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

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
    // 处理Prisma特定错误
    if (error instanceof PrismaClientKnownRequestError) {
      console.error("Prisma错误:", error);
      console.error("错误代码:", error.code);
      console.error("错误元数据:", error.meta);

      // 根据错误代码返回不同的错误信息
      switch (error.code) {
        case "P2025":
          // 记录未找到
          return NextResponse.json(
            {
              success: false,
              error: "无效的refresh token",
              code: ErrorCode.UNAUTHORIZED,
            },
            { status: 401 }
          );
        default:
          // 其他Prisma错误
          return NextResponse.json(
            {
              success: false,
              error: "数据库操作失败",
              details: error.message,
              code: ErrorCode.SERVER_ERROR,
            },
            { status: 500 }
          );
      }
    }

    console.error("Refresh token错误:", error);

    // 处理特定错误信息
    if (error instanceof Error) {
      if (error.message === "无效的refresh token" || error.message === "用户不存在或已禁用") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: ErrorCode.UNAUTHORIZED,
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
        code: ErrorCode.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
