import { z } from "zod";
import { ErrorCode } from "./api-schemas";

// 登录请求的zod模式
export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// 登录响应的zod模式
export const LoginResponseSchema = z.object({
  token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().positive(),
  user: z.object({
    user_id: z.string(),
    email: z.email(),
    username: z.string(),
    nickname: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// 刷新令牌请求的zod模式
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// 刷新令牌响应的zod模式
export const RefreshTokenResponseSchema = z.object({
  token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().positive(),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// 令牌载荷的zod模式
export const TokenPayloadSchema = z.object({
  sub: z.string(), // user_id
  email: z.email(),
  nickname: z.string(),
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;

// JWT令牌的zod模式
export const JwtTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
});

export type JwtTokens = z.infer<typeof JwtTokensSchema>;

// 个人资料更新请求验证模式
export const ProfileUpdateSchema = z.object({
  username: z.string().min(1, "用户名不能为空").max(50, "用户名长度不能超过50个字符"),
  email: z.email("请输入有效的邮箱地址"),
  nickname: z.string().max(50, "昵称长度不能超过50个字符").optional(),
  phone: z.string().max(20, "电话号码长度不能超过20个字符").optional(),
  gender: z.string().max(10, "性别长度不能超过10个字符").optional(),
  bio: z.string().optional(),
  avatar_url: z.string().max(255, "头像URL长度不能超过255个字符").optional(),
  photo: z.string().optional(),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

// 登录成功响应验证模式
export const LoginSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: LoginResponseSchema,
});

export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>;

// 登录API响应验证模式（包含成功和错误响应）
export const LoginApiResponseSchema = z.discriminatedUnion("success", [
  // 成功响应
  LoginSuccessResponseSchema,
  // 错误响应
  z.object({
    success: z.literal(false),
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    error: z.string(),
    details: z.string().optional(),
    data: z.unknown().optional(),
  }),
]);

export type LoginApiResponse = z.infer<typeof LoginApiResponseSchema>;
