import { z } from "zod";

/**
 * 创建示例 Schema
 */
export const createExampleSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  description: z.string().optional(),
  isSafeStorage: z.boolean().optional(), // 支持加密
});

/**
 * 更新示例 Schema
 */
export const updateExampleSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "名称不能为空"),
  description: z.string().optional(),
});

/**
 * 查询示例 Schema
 */
export const queryExampleSchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  keyword: z.string().optional(),
});

/**
 * 类型导出
 */
export type CreateExampleSchema = z.infer<typeof createExampleSchema>;
export type UpdateExampleSchema = z.infer<typeof updateExampleSchema>;
export type QueryExampleSchema = z.infer<typeof queryExampleSchema>;

