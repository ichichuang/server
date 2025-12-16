import { Hono } from "hono";
import { AppError } from "../../errors/AppError.js";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync, statSync } from "fs";

const downloadRoutes = new Hono();

// 文件目录配置（使用 public/file 目录）
const FILE_DIR = join(process.cwd(), "public", "file");

/**
 * 获取文件列表
 * GET /api/download/list
 */
downloadRoutes.get("/api/download/list", async (c) => {
  try {
    if (!existsSync(FILE_DIR)) {
      return c.sendJson({ files: [] }, "文件列表为空");
    }

    const files = await readdir(FILE_DIR);
    const fileList = [];

    for (const file of files) {
      // 跳过隐藏文件
      if (file.startsWith(".")) {
        continue;
      }

      const filePath = join(FILE_DIR, file);
      if (existsSync(filePath)) {
        const stats = statSync(filePath);
        fileList.push({
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          url: `/api/download/file/${encodeURIComponent(file)}`,
        });
      }
    }

    return c.sendJson({ files: fileList, count: fileList.length }, "获取文件列表成功");
  } catch (error) {
    throw AppError.internal("获取文件列表失败");
  }
});

/**
 * 下载文件
 * GET /api/download/file/:filename
 */
downloadRoutes.get("/api/download/file/:filename", async (c) => {
  try {
    const filename = decodeURIComponent(c.req.param("filename"));

    // 安全检查：防止路径遍历攻击
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      throw AppError.badRequest("无效的文件名");
    }

    const filePath = join(FILE_DIR, filename);

    if (!existsSync(filePath)) {
      throw AppError.notFound("文件不存在");
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);
    const stats = statSync(filePath);

    // 设置响应头
    c.header("Content-Type", "application/octet-stream");
    c.header("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    c.header("Content-Length", stats.size.toString());

    // 返回文件
    return c.body(fileBuffer);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("文件下载失败");
  }
});

/**
 * 获取文件信息（不下载）
 * GET /api/download/info/:filename
 */
downloadRoutes.get("/api/download/info/:filename", async (c) => {
  try {
    const filename = decodeURIComponent(c.req.param("filename"));

    // 安全检查
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      throw AppError.badRequest("无效的文件名");
    }

    const filePath = join(FILE_DIR, filename);

    if (!existsSync(filePath)) {
      throw AppError.notFound("文件不存在");
    }

    const stats = statSync(filePath);

    const fileInfo = {
      filename,
      size: stats.size,
      createdAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString(),
      url: `/api/download/file/${encodeURIComponent(filename)}`,
    };

    return c.sendJson(fileInfo, "获取文件信息成功");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("获取文件信息失败");
  }
});

export { downloadRoutes };


