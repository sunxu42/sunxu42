import * as z from "zod";
import {
  UserCreateInputObjectZodSchema,
  UserProfileCreateInputObjectZodSchema,
} from "../generated/zod/schemas/index.js";

// 数据库层全量字段类型（基于生成的Zod）
export const UserCoreSchema = UserCreateInputObjectZodSchema.omit({
  profile: true,
  userRoles: true,
  refreshTokens: true,
  operationLogs: true,
}).extend({
  user_id: z.string(), // 确保主键必填
  updated_at: z.date(), // 补充更新时间字段
});

// 数据库层用户配置文件类型
export const UserProfileCoreSchema = UserProfileCreateInputObjectZodSchema.omit({
  user: true,
}).extend({
  profile_id: z.string(), // 确保主键必填
  updated_at: z.date(), // 补充更新时间字段
  avatar_url: z.string().nullable(),
  phone: z.string().nullable(),
  gender: z.string().nullable(),
  bio: z.string().nullable(),
});

// 基础用户类型（数据库层）
export type UserCore = z.infer<typeof UserCoreSchema>;
// 基础用户配置文件类型（数据库层）
export type UserProfileCore = z.infer<typeof UserProfileCoreSchema>;

// 完整用户类型（包含配置文件）
export const FullUserSchema = UserCoreSchema.extend({
  profile: UserProfileCoreSchema.optional().nullable(),
});

export type FullUser = z.infer<typeof FullUserSchema>;

// 后端API用户类型（大部分字段）
export const ApiUserSchema = FullUserSchema.omit({
  password_hash: true,
  salt: true,
  default_role_id: true,
  last_login_at: true,
  last_login_ip: true,
  updated_at: true,
});

export type ApiUser = z.infer<typeof ApiUserSchema>;

// 前端界面用户类型（仅界面所需字段）
export const FrontendUserSchema = ApiUserSchema.pick({
  user_id: true,
  email: true,
  username: true,
  profile: true,
});

export type FrontendUser = z.infer<typeof FrontendUserSchema>;
