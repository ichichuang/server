import { Hono } from "hono";

const testRoutes = new Hono();

testRoutes.get("/test/get", (c) => {
  return c.text("test get success");
});

testRoutes.post("/test/post", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({
    message: "test post success",
    received: body,
  });
});

export { testRoutes };
