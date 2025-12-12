import { z } from "zod";

/**
 * 测试 POST 请求 Schema
 */
export const testPostSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
});

/**
 * 测试 PUT 请求 Schema
 */
export const testPutSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
});

/**
 * 类型导出
 */
export type TestPostSchema = z.infer<typeof testPostSchema>;
export type TestPutSchema = z.infer<typeof testPutSchema>;
