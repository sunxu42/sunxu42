import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // 从cookie获取refresh token
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "缺少refresh token" }, { status: 401 });
    }

    // 验证refresh token
    const tokenResult = await pool.query(
      "SELECT * FROM auth.refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: "无效的refresh token" }, { status: 401 });
    }

    const tokenData = tokenResult.rows[0];
    const user = await pool.query(
      "SELECT user_id, email, username FROM auth.users WHERE user_id = $1 AND status = 'active'",
      [tokenData.user_id]
    );

    if (user.rows.length === 0) {
      return NextResponse.json({ error: "用户不存在或已禁用" }, { status: 401 });
    }

    // 生成新的access token
    const secretKey = process.env.JWT_SECRET as string;
    const newAccessToken = jwt.sign(
      {
        user_id: user.rows[0].user_id,
        email: user.rows[0].email,
        username: user.rows[0].username,
      },
      secretKey,
      { expiresIn: "4h" }
    );

    // 更新refresh token（每次刷新生成新的refresh token）
    const newRefreshToken = uuidv4();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const clientIp =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 撤销旧的refresh token
    await pool.query(
      "UPDATE auth.refresh_tokens SET is_revoked = true, revoked_at = NOW() WHERE token = $1",
      [refreshToken]
    );

    // 创建新的refresh token
    await pool.query(
      "INSERT INTO auth.refresh_tokens (user_id, token, expires_at, client_info, ip_address) VALUES ($1, $2, $3, $4, $5)",
      [
        user.rows[0].user_id,
        newRefreshToken,
        newExpiresAt,
        req.headers.get("user-agent") || "unknown",
        clientIp,
      ]
    );

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: "Token刷新成功",
      user: user.rows[0],
    });

    // 设置新的tokens到cookie
    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 60 * 60, // 4小时
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

    return response;
  } catch (error: unknown) {
    console.error("Refresh token错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
