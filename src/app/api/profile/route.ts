import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/authMiddleware";
import pool from "@/lib/db";
import { profileUpdateSchema } from "@/lib/schemas/auth";

interface AuthRequest extends NextRequest {
  user?: {
    user_id: string;
  };
}

export const PUT = withAuth(async (req: AuthRequest) => {
  try {
    const requestBody = await req.json();

    // 使用zod验证请求数据
    const { username, email, nickname, phone, gender, bio, avatar_url, photo } =
      profileUpdateSchema.parse(requestBody);

    const { user_id: userId } = req.user!;

    // 更新用户资料
    await pool.query(
      "UPDATE auth.users SET username = $1, email = $2, nickname = $3, phone = $4, gender = $5, bio = $6, avatar_url = $7, photo = $8, updated_at = NOW() WHERE user_id = $9",
      [username, email, nickname, phone, gender, bio, avatar_url, photo, userId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "用户资料更新成功",
        user: {
          username,
          email,
          nickname,
          phone,
          gender,
          bio,
          avatar_url,
          photo,
          user_id: userId,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    // 处理zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "请求数据验证失败",
          details: error.issues.map(i => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    console.error("更新用户资料错误:", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

// 获取用户资料
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    const { user_id: userId } = req.user!;

    // 查询用户资料
    const userResult = await pool.query(
      "SELECT user_id, username, email, nickname, phone, gender, bio, avatar_url, photo FROM auth.users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user: userResult.rows[0],
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("获取用户资料错误:", error);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
