import { z } from "zod";

export enum ErrorCode {
  SUCCESS = 200,
  PARAM_ERROR = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  USER_ALREADY_EXISTS = 409,
  SERVER_ERROR = 500,
}

// API响应类型的zod模式
export const ApiResponseSchema = z.object({
  code: z.enum(ErrorCode),
  message: z.string(),
  success: z.boolean(),
  data: z.unknown(),
});

// 泛型 API 响应校验规则
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return ApiResponseSchema.extend({
    data: dataSchema,
  });
}

// 分页参数的zod模式
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// 分页元数据的zod模式
export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

// 分页响应的zod模式
export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.array(z.any()),
  meta: PaginationMetaSchema,
});

// 从zod模式导出TypeScript类型
export type ApiResponse<T> = z.infer<typeof ApiResponseSchema> & { data?: T };
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginatedResponse<T> = z.infer<typeof PaginatedResponseSchema> & { data: T[] };

// API错误响应验证模式
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
  code: z.number().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
