import { z } from "zod";

/**
 * 检查分片 Schema
 */
export const checkChunksSchema = z.object({
  fileId: z.string().min(1, "文件ID不能为空"),
  fileName: z.string().min(1, "文件名不能为空"),
  fileHash: z.string().min(1, "文件哈希不能为空"),
  totalChunks: z.number().min(1, "总分片数必须大于0"),
});

/**
 * 合并分片 Schema
 */
export const mergeChunksSchema = z.object({
  fileId: z.string().min(1, "文件ID不能为空"),
  fileName: z.string().min(1, "文件名不能为空"),
  fileHash: z.string().min(1, "文件哈希不能为空"),
  totalChunks: z.number().min(1, "总分片数必须大于0"),
});

/**
 * 类型导出
 */
export type CheckChunksSchema = z.infer<typeof checkChunksSchema>;
export type MergeChunksSchema = z.infer<typeof mergeChunksSchema>;


