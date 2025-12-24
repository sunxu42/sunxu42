import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import pg from "pg";
import { Prisma, PrismaClient } from "../generated/prisma/client";

// 创建PostgreSQL连接池
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// 创建Prisma PostgreSQL适配器
const adapter = new PrismaPg(pool);

// 配置Prisma客户端选项（Prisma 7最佳实践）
const prismaClientOptions: Prisma.PrismaClientOptions = {
  // 配置日志（开发环境记录查询，生产环境仅记录错误）
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "info", "warn", "error"],
  // 使用PostgreSQL适配器（Prisma 7要求）
  adapter,
};

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export { prisma };
