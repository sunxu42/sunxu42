import { z } from "zod";

// API用户响应模型
export const ApiUserSchema = z.object({
  user_id: z.string(),
  email: z.email(),
  nickname: z.string().optional(),
  avatar_url: z.url().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type ApiUser = z.infer<typeof ApiUserSchema>;
