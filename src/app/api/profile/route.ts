import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authMiddleware";
import { getProfile, updateProfile } from "@/server/api/auth/profile";
import { ProfileUpdateSchema } from "@/types/auth-schemas";
import { ErrorCode, type ApiResponse } from "@/types/index";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { z } from "zod";

interface AuthRequest extends NextRequest {
  user?: {
    user_id: string;
  };
}

export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    const requestBody = await req.json();

    // 使用zod验证请求数据
    const profileData = ProfileUpdateSchema.parse(requestBody);

    const { user_id: userId } = req.user!;

    // 调用server层的更新逻辑
    const updatedProfile = await updateProfile(userId, profileData);

    // 创建统一API响应
    const successResponse: ApiResponse<typeof updatedProfile> = {
      success: true,
      message: "用户资料更新成功",
      data: updatedProfile,
      code: ErrorCode.SUCCESS,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    // 处理zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "请求数据验证失败",
          details: error.issues.map(i => i.message).join(", "),
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

    console.error("更新用户资料错误:", error);
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
});

// 获取用户资料
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    const { user_id: userId } = req.user!;

    // 调用server层的获取资料逻辑
    const userProfile = await getProfile(userId);

    // 添加消息字段
    const successResponse: ApiResponse<typeof userProfile> = {
      success: true,
      message: "用户资料获取成功",
      data: userProfile,
      code: ErrorCode.SUCCESS,
    };

    return NextResponse.json(successResponse, { status: 200 });
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

    console.error("获取用户资料错误:", error);
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
});
