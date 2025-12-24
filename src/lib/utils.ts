import { NextResponse } from "next/server";
import { ErrorCode } from "@/types/index";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 通用API错误处理函数
 * 封装常见的错误类型处理逻辑，返回统一格式的错误响应
 */
export function handleApiError(error: unknown, context: string) {
  console.error(`${context}错误:`, error);
  if (error instanceof Error) {
    console.error("错误详情:", error.message);
  }

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
    console.error("Prisma错误代码:", error.code);
    console.error("Prisma错误元数据:", error.meta);

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
            error: "记录不存在",
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

  // 处理特定业务错误
  if (error instanceof Error) {
    switch (error.message) {
      case "密码错误":
      case "无效的refresh token":
      case "用户不存在或已禁用":
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

  // 通用服务器错误
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
