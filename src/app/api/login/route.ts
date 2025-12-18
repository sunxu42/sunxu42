import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginRequestSchema } from "@/lib/schemas/auth";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();

    // 使用zod验证请求数据
    const { email, password } = loginRequestSchema.parse(requestBody);

    // 查询用户是否存在
    const userResult = await pool.query(
      "SELECT * FROM auth.users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length > 0) {
      // 用户存在，验证密码
      const user = userResult.rows[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (isPasswordValid) {
        // 更新最后登录时间
        const clientIp =
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown";
        await pool.query(
          "UPDATE auth.users SET last_login_at = NOW(), last_login_ip = $1 WHERE user_id = $2",
          [clientIp, user.user_id]
        );

        // 生成JWT token
        const secretKey = process.env.JWT_SECRET as string;
        const token = jwt.sign(
          { user_id: user.user_id, email: user.email, username: user.username },
          secretKey,
          { expiresIn: "4h" }
        );

        // 创建响应
        const response = NextResponse.json(
          {
            success: true,
            message: "登录成功",
            user: {
              user_id: user.user_id,
              email: user.email,
              username: user.username,
            },
          },
          { status: 200 }
        );

        // 生成refresh token
        const refreshToken = uuidv4();
        const refreshTokenExpiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ); // 7天过期

        // 存储refresh token到数据库
        await pool.query(
          "INSERT INTO auth.refresh_tokens (user_id, token, expires_at, client_info, ip_address) VALUES ($1, $2, $3, $4, $5)",
          [
            user.user_id,
            refreshToken,
            refreshTokenExpiresAt,
            req.headers.get("user-agent") || "unknown",
            clientIp,
          ]
        );

        // 设置token到cookie
        response.cookies.set("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 4 * 60 * 60, // 4小时
        });

        // 设置refresh token到cookie
        response.cookies.set("refresh_token", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7天
        });

        return response;
      } else {
        return NextResponse.json({ error: "密码错误" }, { status: 401 });
      }
    } else {
      // 用户不存在，创建新用户
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = uuidv4();
      const username = email.split("@")[0]; // 使用邮箱前缀作为默认用户名

      await pool.query(
        `INSERT INTO auth.users (
          user_id, username, email, password_hash, status, 
          created_at, updated_at, last_login_at, last_login_ip
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), $6)`,
        [userId, username, email, hashedPassword, "active", "unknown"]
      );

      // 生成JWT token
      const token = jwt.sign(
        { user_id: userId, email: email, username: username },
        process.env.JWT_SECRET as string,
        { expiresIn: "4h" }
      );

      // 创建响应
      const response = NextResponse.json(
        {
          success: true,
          message: "用户创建成功并登录",
          user: {
            user_id: userId,
            email,
            username,
          },
        },
        { status: 201 }
      );

      // 生成refresh token
      const refreshToken = uuidv4();
      const refreshTokenExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ); // 7天过期

      // 存储refresh token到数据库
      const clientIp =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";
      await pool.query(
        "INSERT INTO auth.refresh_tokens (user_id, token, expires_at, client_info, ip_address) VALUES ($1, $2, $3, $4, $5)",
        [
          userId,
          refreshToken,
          refreshTokenExpiresAt,
          req.headers.get("user-agent") || "unknown",
          clientIp,
        ]
      );

      // 设置token到cookie
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 4 * 60 * 60, // 4小时
      });

      // 设置refresh token到cookie
      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7天
      });

      return response;
    }
  } catch (error: unknown) {
    // 处理zod验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "请求数据验证失败",
          details: error.issues.map((e: z.ZodIssue) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    console.error("登录错误:", error);
    if (error instanceof Error) {
      console.error("错误详情:", error.message);
    }
    // 对于其他可能的错误属性，使用可选链和类型断言
    console.error("错误代码:", (error as any)?.code);
    console.error("错误位置:", (error as any)?.position);
    console.error("错误文件:", (error as any)?.file);
    console.error("错误行号:", (error as any)?.line);
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
      },
      { status: 500 }
    );
  }
}
