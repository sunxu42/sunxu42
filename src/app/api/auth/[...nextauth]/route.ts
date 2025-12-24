import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// 用户登录验证schema
const loginSchema = z.object({
  email: z.email("邮箱格式不正确"),
  password: z.string().min(6, "密码长度不能少于6位"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email", placeholder: "请输入邮箱" },
        password: { label: "密码", type: "password", placeholder: "请输入密码" },
      },
      async authorize(credentials) {
        // 验证输入参数
        const { email, password } = loginSchema.parse(credentials);

        // 查找用户
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("用户不存在");
        }

        // 验证密码
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("密码错误");
        }

        // 返回用户信息
        return {
          id: user.user_id,
          email: user.email,
          username: user.username,
          user_id: user.user_id,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60, // 24小时
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  callbacks: {
    async jwt({ token, user }) {
      // 登录时将用户信息添加到token
      if (user) {
        token.user_id = user.id;
        token.email = user.email;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // 将token信息添加到session
      if (session.user) {
        session.user.user_id = token.user_id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      // 受保护路由的授权检查
      const { pathname } = request.nextUrl;

      // 公开路由不需要认证
      if (
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/openapi")
      ) {
        return true;
      }

      // 其他路由需要认证
      return !!auth;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handlers as GET, handlers as POST };
