import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

type User = {
  id: number;
  name: string;
  gender: string;
  age: number;
  email: string;
  phone: string;
  status: "active" | "inactive";
  createdAt: string;
};

let mockUsers: User[] = Array.from({ length: 156 }).map((_, i) => ({
  id: i + 1,
  name: `Test User ${i + 1}`,
  gender: i % 3 === 0 ? "female" : "male",
  age: 20 + (i % 30),
  email: `user${i + 1}@example.com`,
  phone: `+86 13800138${String(i).padStart(3, "0")}`,
  status: i % 5 === 0 ? "inactive" : "active",
  createdAt: new Date(Date.now() - i * 10_000_000).toISOString(),
}));

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const router = new Hono();

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  gender: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

router.get("/", zValidator("query", listQuerySchema), async (c) => {
  await delay(400);
  const { page, limit, search, gender, sortBy, order } = c.req.valid("query");

  let filtered = [...mockUsers];

  if (search) {
    filtered = filtered.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()),
    );
  }
  if (gender) {
    filtered = filtered.filter((u) => u.gender === gender);
  }

  if (sortBy) {
    filtered.sort((a, b) => {
      const valA = a[sortBy as keyof User];
      const valB = b[sortBy as keyof User];
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  const total = filtered.length;
  const list = filtered.slice((page - 1) * limit, page * limit);

  return c.json({ code: 200, message: "success", data: { list, total } });
});

router.post("/", async (c) => {
  await delay(300);
  const body = await c.req.json();
  const newUser = {
    ...body,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  mockUsers.unshift(newUser);
  return c.json({ code: 200, message: "Created successfully", data: newUser });
});

router.put("/:id", async (c) => {
  await delay(300);
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx > -1) {
    mockUsers[idx] = { ...mockUsers[idx], ...body };
    return c.json({ code: 200, message: "Updated successfully", data: null });
  }
  return c.json({ code: 404, message: "User not found", data: null }, 404);
});

router.delete("/:id", async (c) => {
  await delay(300);
  const id = Number(c.req.param("id"));
  mockUsers = mockUsers.filter((u) => u.id !== id);
  return c.json({ code: 200, message: "Deleted successfully", data: null });
});

export default router;
