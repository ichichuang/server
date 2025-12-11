import { Hono } from "hono";

const testRoutes = new Hono();

/* get test */
testRoutes.get("/test/get", (c) => {
  return c.text("test get success");
});

/* post test */
testRoutes.post("/test/post", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({
    message: "test post success",
    received: body,
  });
});

/* put test */
testRoutes.put("/test/put", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({
    message: "test put success",
    received: body,
  });
});

/* delete test */
testRoutes.delete("/test/delete", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json({
    message: "test delete success",
    received: body,
  });
});

export { testRoutes };
