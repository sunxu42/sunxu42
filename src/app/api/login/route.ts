import { NextRequest, NextResponse } from "next/server";
import { login } from "@/server/api/auth/login";
import { ErrorCode, LoginRequestSchema, LoginResponse, type ApiResponse } from "@/types/index";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { z } from "zod";

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
    setAuthCookies(response, loginResponse.token, loginResponse.refresh_token);

    return response;
  } catch (error: unknown) {
    // 处理zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "请求数据验证失败",
          details: error.issues.map((e: z.ZodIssue) => e.message).join(", "),
          code: ErrorCode.PARAM_ERROR,
        },
        { status: 400 }
      );
    }

    // 处理Prisma特定错误
    if (error instanceof PrismaClientKnownRequestError) {
      console.error("Prisma错误:", error);
      console.error("错误代码:", error.code);
      console.error("错误元数据:", error.meta);

      // 根据错误代码返回不同的错误信息
      switch (error.code) {
        case "P2002":
          // 唯一约束冲突
          const field = error.meta?.target as string;
          return NextResponse.json(
            {
              success: false,
              error: field ? `${field}已被占用` : "数据冲突",
              code: ErrorCode.USER_ALREADY_EXISTS,
            },
            { status: 409 }
          );
        case "P2025":
          // 记录未找到
          return NextResponse.json(
            {
              success: false,
              error: "用户不存在",
              code: ErrorCode.NOT_FOUND,
            },
            { status: 404 }
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

    console.error("登录错误:", error);
    if (error instanceof Error) {
      console.error("错误详情:", error.message);
    }

    // 处理密码错误
    if (error instanceof Error && error.message === "密码错误") {
      return NextResponse.json(
        {
          success: false,
          error: "密码错误",
          code: ErrorCode.UNAUTHORIZED,
        },
        { status: 401 }
      );
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
