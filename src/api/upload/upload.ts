import { Hono } from "hono";
import { AppError } from "../../errors/AppError.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const uploadRoutes = new Hono();

// 上传目录配置
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

// 确保上传目录存在
const ensureUploadDir = async () => {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * 单文件上传
 * POST /api/upload/file
 */
uploadRoutes.post("/api/upload/file", async (c) => {
  try {
    await ensureUploadDir();

    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file) {
      throw AppError.badRequest("文件不能为空");
    }

    // 保存文件
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await writeFile(filePath, Buffer.from(fileBuffer));

    const fileInfo = {
      filename: file.name,
      originalName: file.name,
      savedName: fileName,
      size: file.size,
      type: file.type,
      url: `/uploads/${fileName}`,
      uploadedAt: new Date().toISOString(),
    };

    return c.sendJson(fileInfo, "上传成功");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("文件上传失败");
  }
});

/**
 * 多文件上传
 * POST /api/upload/files
 */
uploadRoutes.post("/api/upload/files", async (c) => {
  try {
    await ensureUploadDir();

    const body = await c.req.parseBody();
    const files = body.files;

    if (!files) {
      throw AppError.badRequest("文件不能为空");
    }

    // 处理文件数组（可能是单个文件或文件数组）
    const fileList = Array.isArray(files) ? files : [files];
    const results = [];

    for (const file of fileList) {
      const fileObj = file as File;
      if (!fileObj) continue;

      // 保存文件
      const fileBuffer = await fileObj.arrayBuffer();
      const fileName = `${Date.now()}_${fileObj.name}`;
      const filePath = join(UPLOAD_DIR, fileName);

      await writeFile(filePath, Buffer.from(fileBuffer));

      results.push({
        filename: fileObj.name,
        originalName: fileObj.name,
        savedName: fileName,
        size: fileObj.size,
        type: fileObj.type,
        url: `/uploads/${fileName}`,
        uploadedAt: new Date().toISOString(),
      });
    }

    return c.sendJson({ files: results, count: results.length }, "批量上传成功");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("批量文件上传失败");
  }
});

export { uploadRoutes };


