import { Hono } from "hono";
import { validator } from "../../middleware/validator.js";
import {
  testPostSchema,
  testPutSchema,
  type TestPostSchema,
  type TestPutSchema,
} from "../../validators/schemas/testSchemas.js";

const testRoutes = new Hono();

/**
 * 测试 GET 接口
 * GET /test/get
 */
testRoutes.get("/test/get", (c) => {
  return c.text("test get success");
});

/**
 * 测试 POST 接口 - 支持加密解密
 * POST /test/post
 */
testRoutes.post(
  "/test/post",
  // ✅ 支持 isSafeStorage 加密解密
  validator("json", testPostSchema),
  async (c) => {
    // ✅ 已自动解密（如果请求包含 isSafeStorage: true）
    const validData = (c.req as any).valid("json");
    const { name } = validData as TestPostSchema;

    return c.json({
      success: true,
      message: "test post success",
      data: {
        received: { name },
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * 测试 PUT 接口 - 支持加密解密
 * PUT /test/put
 */
testRoutes.put(
  "/test/put",
  // ✅ 支持 isSafeStorage 加密解密
  validator("json", testPutSchema),
  async (c) => {
    // ✅ 已自动解密（如果请求包含 isSafeStorage: true）
    const validData = (c.req as any).valid("json");
    const { name } = validData as TestPutSchema;

    return c.json({
      success: true,
      message: "test put success",
      data: {
        received: { name },
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * 测试 DELETE 接口
 * DELETE /test/delete
 */
testRoutes.delete("/test/delete", async (c) => {
  return c.json({
    success: true,
    message: "test delete success",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

export { testRoutes };
