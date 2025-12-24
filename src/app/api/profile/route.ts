import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authMiddleware";
import { handleApiError } from "@/lib/utils";
import { getProfile, updateProfile } from "@/server/api/auth/profile";
import { ProfileUpdateSchema } from "@/types/auth-schemas";
import { ErrorCode, type ApiResponse } from "@/types/index";

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
    return handleApiError(error, "更新用户资料");
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
    return handleApiError(error, "获取用户资料");
  }
});
