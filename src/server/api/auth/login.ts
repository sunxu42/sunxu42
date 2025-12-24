import { prisma } from "@/lib/prisma";
import { type LoginResponse } from "@/types/index";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// 辅助函数：生成JWT token和refresh token
export async function generateTokens(user: {
  user_id: string;
  email: string;
  username?: string;
  nickname?: string;
}) {
  const secretKey = process.env.JWT_SECRET as string;
  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
    },
    secretKey,
    { expiresIn: "4h" }
  );

  const refreshToken = uuidv4();
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天过期

  return { token, refreshToken, refreshTokenExpiresAt, expiresIn: 4 * 60 * 60 };
}

// 辅助函数：保存refresh token到数据库（添加安全措施）
export async function saveRefreshToken(
  userId: string,
  refreshToken: string,
  refreshTokenExpiresAt: Date,
  clientInfo: string,
  ipAddress: string
) {
  // 使用事务确保原子性操作
  await prisma.$transaction(async tx => {
    // 1. 删除用户所有已过期的refresh tokens
    await tx.refreshToken.deleteMany({
      where: {
        user_id: userId,
        expires_at: { lt: new Date() },
      },
    });

    // 2. 如果活跃tokens超过10个，删除最旧的多余tokens
    // 先获取需要保留的最活跃的9个tokens的ID
    const tokensToKeep = await tx.refreshToken.findMany({
      where: {
        user_id: userId,
        expires_at: { gte: new Date() },
      },
      orderBy: {
        created_at: "desc", // 获取最新的
      },
      take: 9, // 保留最新的9个
      select: {
        refresh_token_id: true, // 只选择ID字段以提高性能
      },
    });

    // 提取需要保留的tokens的ID
    const tokenIdsToKeep = tokensToKeep.map(token => token.refresh_token_id);

    // 如果有需要保留的tokens，删除其他所有活跃tokens
    if (tokenIdsToKeep.length > 0) {
      await tx.refreshToken.deleteMany({
        where: {
          user_id: userId,
          expires_at: { gte: new Date() },
          refresh_token_id: { notIn: tokenIdsToKeep }, // 只删除不在保留列表中的tokens
        },
      });
    }

    // 3. 创建新的refresh token
    await tx.refreshToken.create({
      data: {
        user_id: userId,
        token: refreshToken,
        expires_at: refreshTokenExpiresAt,
        client_info: clientInfo,
        ip_address: ipAddress,
      },
    });
  });
}

// 登录服务函数
export async function login(
  email: string,
  password: string,
  clientInfo: string,
  ipAddress: string
): Promise<LoginResponse> {
  try {
    // 查询用户是否存在，使用精确的字段选择以提高性能
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        user_id: true,
        email: true,
        username: true,
        password_hash: true,
        profile: {
          select: {
            nickname: true,
          },
        },
      },
    });

    if (user) {
      // 用户存在，使用bcrypt验证密码（更安全的做法）
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (isPasswordValid) {
        // 更新最后登录时间
        await prisma.user.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            last_login_at: new Date(),
            last_login_ip: ipAddress,
          },
        });

        // 处理nickname默认值：如果不存在，使用邮箱@前面的部分
        const nickname = user.profile?.nickname || user.email.split("@")[0];

        // 生成token和refresh token
        const { token, refreshToken, refreshTokenExpiresAt, expiresIn } = await generateTokens({
          user_id: user.user_id,
          email: user.email,
          username: user.username || undefined,
          nickname,
        });

        // 存储refresh token到数据库
        await saveRefreshToken(
          user.user_id,
          refreshToken,
          refreshTokenExpiresAt,
          clientInfo,
          ipAddress
        );

        // 返回登录响应数据
        return {
          token,
          refresh_token: refreshToken,
          expires_in: expiresIn,
          user: {
            user_id: user.user_id,
            email: user.email,
            username: user.username || email.split("@")[0],
            nickname: nickname,
          },
        };
      } else {
        // 密码错误
        throw new Error("密码错误");
      }
    } else {
      // 用户不存在，创建新用户
      const username = email.split("@")[0]; // 使用邮箱前缀作为默认用户名
      const nickname = username; // 使用邮箱前缀作为默认昵称

      // 使用Prisma 7事务API创建用户和用户资料（原子操作）
      const newUser = await prisma.$transaction(async tx => {
        // 对密码进行哈希处理
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户基本信息并包含用户资料（使用嵌套创建）
        const createdUserWithProfile = await tx.user.create({
          data: {
            username,
            email,
            password_hash: hashedPassword,
            status: "active",
            last_login_at: new Date(),
            last_login_ip: ipAddress,
            profile: {
              create: {
                nickname,
              },
            },
          },
          // 返回包含用户资料的完整信息
          select: {
            user_id: true,
            email: true,
            username: true,
          },
        });

        return createdUserWithProfile;
      });

      // 生成token和refresh token
      const { token, refreshToken, refreshTokenExpiresAt, expiresIn } = await generateTokens({
        user_id: newUser.user_id,
        email: newUser.email,
        username: newUser.username || undefined,
        nickname: nickname,
      });

      // 存储refresh token到数据库
      await saveRefreshToken(
        newUser.user_id,
        refreshToken,
        refreshTokenExpiresAt,
        clientInfo,
        ipAddress
      );

      // 返回登录响应数据
      return {
        token,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          username: newUser.username || email.split("@")[0],
          nickname,
        },
      };
    }
  } catch (error) {
    // 重新抛出Prisma错误，让上层处理
    if (error instanceof PrismaClientKnownRequestError) {
      throw error;
    }
    // 重新抛出其他错误
    throw error;
  }
}
