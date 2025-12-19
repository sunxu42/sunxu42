import { z } from "zod";

// 登录请求验证模式
export const loginRequestSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码长度不能少于6个字符"),
});

// 登录响应验证模式
export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    user_id: z.string(),
    email: z.string().email(),
    username: z.string(),
  }),
});

// 个人资料更新请求验证模式
export const profileUpdateSchema = z.object({
  username: z.string().min(1, "用户名不能为空").max(50, "用户名长度不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  nickname: z.string().max(50, "昵称长度不能超过50个字符").optional(),
  phone: z.string().max(20, "电话号码长度不能超过20个字符").optional(),
  gender: z.string().max(10, "性别长度不能超过10个字符").optional(),
  bio: z.string().optional(),
  avatar_url: z.string().max(255, "头像URL长度不能超过255个字符").optional(),
  photo: z.string().optional(),
});

// 个人资料更新响应验证模式
export const profileUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    user_id: z.string(),
    email: z.string().email(),
    username: z.string(),
    nickname: z.string().optional(),
    phone: z.string().optional(),
    gender: z.string().optional(),
    bio: z.string().optional(),
    avatar_url: z.string().optional(),
    photo: z.string().optional(),
  }),
});
