import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomEmail(): string {
  const username = generateRandomString(8);
  const domains = ["example.com", "test.com", "guest.com"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

function generateRandomUsername(): string {
  const prefix = "guest_";
  const randomPart = generateRandomString(6);
  return `${prefix}${randomPart}`;
}

function generateRandomPassword(): string {
  return generateRandomString(12);
}

export async function POST() {
  try {
    const email = generateRandomEmail();
    const username = generateRandomUsername();
    const password = generateRandomPassword();
    const salt = randomUUID();

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        user_id: randomUUID(),
        email,
        username,
        password_hash,
        salt,
        status: "active",
        last_login_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        password,
      },
    });
  } catch (error) {
    console.error("Error creating guest user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create guest user" },
      { status: 500 }
    );
  }
}
