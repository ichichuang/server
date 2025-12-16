import { Hono } from "hono";
import { validator } from "../../middleware/validator.js";
import {
  createExampleSchema,
  updateExampleSchema,
  queryExampleSchema,
  type CreateExampleSchema,
  type UpdateExampleSchema,
  type QueryExampleSchema,
} from "../../validators/schemas/exampleSchemas.js";
import { AppError } from "../../errors/AppError.js";

const exampleRoutes = new Hono();

// 模拟数据存储
const exampleData: Array<{ id: number; name: string; description?: string; createdAt: string }> = [
  { id: 1, name: "示例1", description: "这是第一个示例", createdAt: new Date().toISOString() },
  { id: 2, name: "示例2", description: "这是第二个示例", createdAt: new Date().toISOString() },
];

/**
 * GET 请求示例 - 获取列表（支持缓存）
 * GET /api/example/list
 */
exampleRoutes.get("/api/example/list", async (c) => {
  const query = c.req.query();
  const page = query.page ? parseInt(query.page) : 1;
  const pageSize = query.pageSize ? parseInt(query.pageSize) : 10;
  const keyword = query.keyword || "";

  // 过滤数据
  let filteredData = exampleData;
  if (keyword) {
    filteredData = exampleData.filter(
      (item) => item.name.includes(keyword) || item.description?.includes(keyword)
    );
  }

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);

  const data = {
    list: paginatedData,
    total: filteredData.length,
    page,
    pageSize,
  };

  return c.sendJson(data, "获取成功");
});

/**
 * GET 请求示例 - 获取详情
 * GET /api/example/:id
 */
exampleRoutes.get("/api/example/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    throw AppError.badRequest("无效的ID");
  }

  const item = exampleData.find((item) => item.id === id);

  if (!item) {
    throw AppError.notFound("示例不存在");
  }

  return c.sendJson(item, "获取成功");
});

/**
 * POST 请求示例 - 创建（支持加密数据）
 * POST /api/example/create
 */
exampleRoutes.post(
  "/api/example/create",
  validator("json", createExampleSchema),
  async (c) => {
    // validData 已经是解密后的数据（如果 isSafeStorage: true）
    const validData = (c.req as any).valid("json") as CreateExampleSchema;
    const { name, description } = validData;

    const newItem = {
      id: Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };

    exampleData.push(newItem);

    // 如果需要返回加密数据，添加 isSafeStorage: true
    const response = { ...newItem, isSafeStorage: false };

    return c.sendJson(response, "创建成功");
  }
);

/**
 * PUT 请求示例 - 更新
 * PUT /api/example/update
 */
exampleRoutes.put(
  "/api/example/update",
  validator("json", updateExampleSchema),
  async (c) => {
    const validData = (c.req as any).valid("json") as UpdateExampleSchema;
    const { id, name, description } = validData;

    const index = exampleData.findIndex((item) => item.id === id);

    if (index === -1) {
      throw AppError.notFound("示例不存在");
    }

    exampleData[index] = {
      ...exampleData[index],
      name,
      description,
    };

    return c.sendJson(exampleData[index], "更新成功");
  }
);

/**
 * PATCH 请求示例 - 部分更新
 * PATCH /api/example/patch/:id
 */
exampleRoutes.patch("/api/example/patch/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();

  if (isNaN(id)) {
    throw AppError.badRequest("无效的ID");
  }

  const index = exampleData.findIndex((item) => item.id === id);

  if (index === -1) {
    throw AppError.notFound("示例不存在");
  }

  exampleData[index] = {
    ...exampleData[index],
    ...body,
  };

  return c.sendJson(exampleData[index], "更新成功");
});

/**
 * DELETE 请求示例 - 删除
 * DELETE /api/example/:id
 */
exampleRoutes.delete("/api/example/:id", async (c) => {
  const id = parseInt(c.req.param("id"));

  if (isNaN(id)) {
    throw AppError.badRequest("无效的ID");
  }

  const index = exampleData.findIndex((item) => item.id === id);

  if (index === -1) {
    throw AppError.notFound("示例不存在");
  }

  exampleData.splice(index, 1);

  return c.sendJson({ id }, "删除成功");
});

export { exampleRoutes };


