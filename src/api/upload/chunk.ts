import { Hono } from "hono";
import { validator } from "../../middleware/validator.js";
import {
  checkChunksSchema,
  mergeChunksSchema,
  type CheckChunksSchema,
  type MergeChunksSchema,
} from "../../validators/schemas/uploadSchemas.js";
import { AppError } from "../../errors/AppError.js";
import { writeFile, mkdir, readFile, unlink, readdir, rmdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const chunkUploadRoutes = new Hono();

// 分片上传目录配置
const CHUNK_DIR = join(process.cwd(), "public", "chunks");
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// 确保目录存在
const ensureDirs = async () => {
  if (!existsSync(CHUNK_DIR)) {
    await mkdir(CHUNK_DIR, { recursive: true });
  }
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
};

// 存储分片上传状态（实际项目中应使用数据库）
const chunkStatus = new Map<string, Set<number>>();

/**
 * 检查已上传的分片
 * POST /api/upload/check
 */
chunkUploadRoutes.post(
  "/api/upload/check",
  validator("json", checkChunksSchema),
  async (c) => {
    try {
      await ensureDirs();

      const { fileId, fileHash } = (c.req as any).valid("json") as CheckChunksSchema;

      // 检查分片目录是否存在
      const chunkDir = join(CHUNK_DIR, fileId);
      const uploadedChunks: number[] = [];

      if (existsSync(chunkDir)) {
        // 读取已上传的分片
        const files = await readdir(chunkDir);
        for (const file of files) {
          const chunkIndex = parseInt(file);
          if (!isNaN(chunkIndex)) {
            uploadedChunks.push(chunkIndex);
          }
        }
        uploadedChunks.sort((a, b) => a - b);
      }

      // 更新内存中的状态
      if (!chunkStatus.has(fileId)) {
        chunkStatus.set(fileId, new Set(uploadedChunks));
      } else {
        uploadedChunks.forEach((index) => chunkStatus.get(fileId)!.add(index));
      }

      return c.sendJson({ uploadedChunks }, "检查完成");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internal("检查分片失败");
    }
  }
);

/**
 * 上传单个分片
 * POST /api/upload/chunk
 */
chunkUploadRoutes.post("/api/upload/chunk", async (c) => {
  try {
    await ensureDirs();

    const body = await c.req.parseBody();

    const file = body.file as File;
    const fileId = body.fileId as string;
    const fileName = body.fileName as string;
    const fileHash = body.fileHash as string;
    const chunkIndex = parseInt(body.chunkIndex as string);
    const totalChunks = parseInt(body.totalChunks as string);
    const chunkSize = parseInt(body.chunkSize as string);
    const fileSize = parseInt(body.fileSize as string);

    if (!file || !fileId || isNaN(chunkIndex)) {
      throw AppError.badRequest("分片数据不完整");
    }

    // 创建分片目录
    const chunkDir = join(CHUNK_DIR, fileId);
    if (!existsSync(chunkDir)) {
      await mkdir(chunkDir, { recursive: true });
    }

    // 保存分片
    const chunkBuffer = await file.arrayBuffer();
    const chunkPath = join(chunkDir, chunkIndex.toString());

    await writeFile(chunkPath, Buffer.from(chunkBuffer));

    // 更新状态
    if (!chunkStatus.has(fileId)) {
      chunkStatus.set(fileId, new Set());
    }
    chunkStatus.get(fileId)!.add(chunkIndex);

    return c.sendJson(
      {
        chunkIndex,
        saved: true,
        uploadedChunks: Array.from(chunkStatus.get(fileId) || []),
      },
      "分片上传成功"
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("分片上传失败");
  }
});

/**
 * 合并分片
 * POST /api/upload/merge
 */
chunkUploadRoutes.post(
  "/api/upload/merge",
  validator("json", mergeChunksSchema),
  async (c) => {
    try {
      await ensureDirs();

      const { fileId, fileName, fileHash, totalChunks } = (c.req as any).valid(
        "json"
      ) as MergeChunksSchema;

      const chunkDir = join(CHUNK_DIR, fileId);

      if (!existsSync(chunkDir)) {
        throw AppError.badRequest("分片目录不存在");
      }

      // 读取所有分片
      const chunks: Buffer[] = [];
      const uploadedChunks = chunkStatus.get(fileId) || new Set();

      // 检查是否所有分片都已上传
      for (let i = 0; i < totalChunks; i++) {
        if (!uploadedChunks.has(i)) {
          throw AppError.badRequest(`分片 ${i} 未上传`);
        }

        const chunkPath = join(chunkDir, i.toString());
        if (!existsSync(chunkPath)) {
          throw AppError.badRequest(`分片 ${i} 文件不存在`);
        }

        const chunkBuffer = await readFile(chunkPath);
        chunks.push(chunkBuffer);
      }

      // 合并分片
      const mergedBuffer = Buffer.concat(chunks);
      const finalFileName = `${Date.now()}_${fileName}`;
      const finalFilePath = join(UPLOAD_DIR, finalFileName);

      await writeFile(finalFilePath, mergedBuffer);

      // 清理分片文件
      try {
        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = join(chunkDir, i.toString());
          if (existsSync(chunkPath)) {
            await unlink(chunkPath);
          }
        }
        // 删除分片目录
        if (existsSync(chunkDir)) {
          await rmdir(chunkDir);
        }
      } catch (cleanupError) {
        console.warn("清理分片文件失败:", cleanupError);
      }

      // 清理状态
      chunkStatus.delete(fileId);

      const fileInfo = {
        fileId,
        fileName,
        savedName: finalFileName,
        url: `/uploads/${finalFileName}`,
        size: mergedBuffer.length,
        uploadedAt: new Date().toISOString(),
      };

      return c.sendJson(fileInfo, "文件合并成功");
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internal("文件合并失败");
    }
  }
);

export { chunkUploadRoutes };


