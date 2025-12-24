import type { DefaultSession, Session } from "next-auth";
import { auth, getServerSession } from "next-auth/react";

// 扩展Session和User类型以包含user_id
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      user_id: string;
      username: string;
    } & DefaultSession["user"];
  }
}

// 导出next-auth的auth和getServerSession函数
export { auth, getServerSession };
