import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// 定义刷新token的响应类型
export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    user_id: string;
    email: string;
    username: string;
    nickname: string;
  };
}

// 刷新token逻辑
export async function refreshToken(
  refreshToken: string,
  clientInfo: string,
  ipAddress: string
): Promise<RefreshTokenResponse> {
  try {
    // 1. 验证refresh token是否有效
    const tokenData = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
        is_revoked: false,
        expires_at: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!tokenData) {
      throw new Error("无效的refresh token");
    }

    const user = tokenData.user;

    // 2. 检查用户状态
    if (user.status !== "active") {
      throw new Error("用户不存在或已禁用");
    }

    // 3. 处理nickname默认值
    const nickname = user.profile?.nickname || user.email.split("@")[0];

    // 4. 生成新的tokens
    const secretKey = process.env.JWT_SECRET as string;
    const newAccessToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        nickname,
      },
      secretKey,
      { expiresIn: "4h" }
    );

    const newRefreshToken = uuidv4();
    const newRefreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天过期

    // 5. 使用事务确保原子性操作
    await prisma.$transaction(async tx => {
      // 5.1 撤销旧的refresh token
      await tx.refreshToken.update({
        where: {
          refresh_token_id: tokenData.refresh_token_id,
        },
        data: {
          is_revoked: true,
          revoked_at: new Date(),
        },
      });

      // 5.2 保存新的refresh token
      await tx.refreshToken.create({
        data: {
          user_id: user.user_id,
          token: newRefreshToken,
          expires_at: newRefreshTokenExpiresAt,
          client_info: clientInfo,
          ip_address: ipAddress,
        },
      });
    });

    // 6. 构造返回数据
    return {
      token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 4 * 60 * 60, // 4小时
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username || user.email.split("@")[0],
        nickname,
      },
    };
  } catch (error) {
    // 重新抛出Prisma错误，让上层处理
    if (error instanceof PrismaClientKnownRequestError) {
      throw error;
    }
    // 重新抛出其他错误
    throw error;
  }
}
