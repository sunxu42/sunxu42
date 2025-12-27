import { User } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function verifyCredentials(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.status !== "active") {
      return { success: false, error: "User account is not active" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return { success: false, error: "Invalid password" };
    }

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        last_login_at: new Date(),
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user by id:", error);
    return null;
  }
}
