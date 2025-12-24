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
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.enum(ErrorCode),
    message: z.string(),
    success: z.boolean(),
    data: dataSchema,
  });
}

// 保持向后兼容的默认版本
export const ApiResponseSchema = createApiResponseSchema(z.unknown());

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
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });
}

// 保持向后兼容的默认版本
export const PaginatedResponseSchema = createPaginatedResponseSchema(z.any());

// 从zod模式导出TypeScript类型
export type ApiResponse<T> = z.infer<ReturnType<typeof createApiResponseSchema<z.ZodTypeAny>>> & {
  data: T;
};
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof createPaginatedResponseSchema<z.ZodTypeAny>>
> & { data: T[] };

// API错误响应验证模式
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
  code: z.number().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
