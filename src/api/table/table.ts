import { Hono } from "hono";

const tableRoutes = new Hono();

interface TableRow {
  id: number;
  name: string;
  email: string;
  index: number;
  createdAt: string;
}

const TOTAL_ROWS = 100;

const makeRow = (idx: number): TableRow => {
  const id = idx + 1;

  return {
    id,
    name: `用户 ${id}`,
    email: `user${id}@table-demo.com`,
    index: id,
    createdAt: new Date(
      Date.now() - idx * 24 * 60 * 60 * 1000
    ).toISOString(),
  };
};

/**
 * 表格分页示例接口
 * GET /table/list?page=1&pageSize=20
 */
tableRoutes.get("/table/list", (c) => {
  const pageParam = c.req.query("page") ?? "1";
  const pageSizeParam = c.req.query("pageSize") ?? "20";

  const page = Number.isNaN(Number(pageParam)) ? 1 : Number(pageParam);
  const pageSize = Number.isNaN(Number(pageSizeParam))
    ? 20
    : Number(pageSizeParam);

  const safePage = page < 1 ? 1 : page;
  const safePageSize = pageSize < 1 ? 20 : pageSize;

  const total = TOTAL_ROWS;
  const totalPages = Math.ceil(total / safePageSize);

  if (safePage > totalPages && totalPages > 0) {
    return c.sendJson(
      {
        list: [] as TableRow[],
        page: safePage,
        pageSize: safePageSize,
        total,
        hasNext: false,
      },
      "暂无更多数据"
    );
  }

  const start = (safePage - 1) * safePageSize;
  const end = Math.min(start + safePageSize, total);

  const list: TableRow[] = [];

  for (let i = start; i < end; i++) {
    list.push(makeRow(i));
  }

  const hasNext = safePage < totalPages;

  return c.sendJson(
    {
      list,
      page: safePage,
      pageSize: safePageSize,
      total,
      hasNext,
    },
    "获取表格数据成功"
  );
});

export { tableRoutes };

