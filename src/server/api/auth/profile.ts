import { prisma } from "@/lib/prisma";
import { type ProfileUpdate } from "@/types/auth-schemas";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

// 获取用户资料
export async function getProfile(userId: string) {
  try {
    // 使用prisma查询用户资料，包括profile关系
    const user = await prisma.user.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        profile: {
          select: {
            nickname: true,
            avatar_url: true,
            phone: true,
            gender: true,
            bio: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    // 处理nickname默认值：如果不存在，使用邮箱@前面的部分
    const nickname = user.profile?.nickname || user.email.split("@")[0];

    // 构造返回数据
    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        nickname,
        avatar_url: user.profile?.avatar_url,
        phone: user.profile?.phone,
        gender: user.profile?.gender,
        bio: user.profile?.bio,
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

// 更新用户资料
export async function updateProfile(
  userId: string,
  profileData: ProfileUpdate
): Promise<ReturnType<typeof getProfile>> {
  try {
    // 使用事务确保原子性操作
    const updatedUser = await prisma.$transaction(async tx => {
      // 1. 更新用户基本信息
      const updatedBaseUser = await tx.user.update({
        where: {
          user_id: userId,
        },
        data: {
          username: profileData.username,
          email: profileData.email,
        },
        select: {
          user_id: true,
          username: true,
          email: true,
        },
      });

      // 2. 更新或创建用户资料
      const updatedProfile = await tx.userProfile.upsert({
        where: {
          user_id: userId,
        },
        update: {
          nickname: profileData.nickname,
          phone: profileData.phone,
          gender: profileData.gender,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        },
        create: {
          user_id: userId,
          nickname: profileData.nickname || updatedBaseUser.email.split("@")[0],
          phone: profileData.phone,
          gender: profileData.gender,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        },
        select: {
          nickname: true,
          avatar_url: true,
          phone: true,
          gender: true,
          bio: true,
        },
      });

      return {
        ...updatedBaseUser,
        profile: updatedProfile,
      };
    });

    // 处理nickname默认值：如果不存在，使用邮箱@前面的部分
    const nickname = updatedUser.profile?.nickname || updatedUser.email.split("@")[0];

    // 构造返回数据
    return {
      user: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
        nickname,
        avatar_url: updatedUser.profile?.avatar_url,
        phone: updatedUser.profile?.phone,
        gender: updatedUser.profile?.gender,
        bio: updatedUser.profile?.bio,
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
