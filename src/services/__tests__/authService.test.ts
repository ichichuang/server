import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import { createAuthService } from "../authService.js";
import { AppError } from "../../errors/AppError.js";

// Mock 依赖
vi.mock("../../auth/userData.js", () => ({
  findUserByUsername: vi.fn(),
  verifyPassword: vi.fn(),
  findUserById: vi.fn(),
}));

vi.mock("../../libs/tokenManager.js", () => ({
  generateToken: vi.fn(),
  getUserFromToken: vi.fn(),
}));

import * as userData from "../../auth/userData.js";
import * as tokenManager from "../../libs/tokenManager.js";

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("登录成功应返回 token 与 isSafeStorage", async () => {
    const service = createAuthService();
    const mockUser = {
      userId: "u1",
      username: "admin",
      roles: ["admin"],
      permissions: [],
      password: "x",
    };

    (
      userData.findUserByUsername as MockedFunction<
        typeof userData.findUserByUsername
      >
    ).mockReturnValue(mockUser);
    (
      userData.verifyPassword as MockedFunction<typeof userData.verifyPassword>
    ).mockReturnValue(true);
    (
      tokenManager.generateToken as MockedFunction<
        typeof tokenManager.generateToken
      >
    ).mockReturnValue("token-123");

    const res = await service.login("admin", "password");

    expect(tokenManager.generateToken).toHaveBeenCalledWith("u1", "admin", [
      "admin",
    ]);
    expect(res).toEqual({ token: "token-123", isSafeStorage: true });
  });

  it("密码错误应抛出 AppError.unauthorized", async () => {
    const service = createAuthService();
    const mockUser = {
      userId: "u1",
      username: "admin",
      roles: ["admin"],
      permissions: [],
      password: "x",
    };

    (
      userData.findUserByUsername as MockedFunction<
        typeof userData.findUserByUsername
      >
    ).mockReturnValue(mockUser);
    (
      userData.verifyPassword as MockedFunction<typeof userData.verifyPassword>
    ).mockReturnValue(false);

    await expect(service.login("admin", "badpass")).rejects.toBeInstanceOf(
      AppError
    );
    await expect(service.login("admin", "badpass")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe("authService.getUserInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("token 有效时返回用户信息（去除密码）", async () => {
    const service = createAuthService();
    const token = "tok";
    (
      tokenManager.getUserFromToken as MockedFunction<
        typeof tokenManager.getUserFromToken
      >
    ).mockReturnValue({ userId: "u1", username: "admin", roles: ["admin"] });
    (
      userData.findUserById as MockedFunction<typeof userData.findUserById>
    ).mockReturnValue({
      userId: "u1",
      username: "admin",
      roles: ["admin"],
      permissions: ["p1"],
      password: "secret",
    });

    const res = await service.getUserInfo(token);

    expect(userData.findUserById).toHaveBeenCalledWith("u1");
    expect(res).toEqual({
      userId: "u1",
      username: "admin",
      roles: ["admin"],
      permissions: ["p1"],
    });
  });

  it("token 无效时抛出 401", async () => {
    const service = createAuthService();
    (
      tokenManager.getUserFromToken as MockedFunction<
        typeof tokenManager.getUserFromToken
      >
    ).mockReturnValue(null);

    await expect(service.getUserInfo("bad-token")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("用户不存在时抛出 404", async () => {
    const service = createAuthService();
    (
      tokenManager.getUserFromToken as MockedFunction<
        typeof tokenManager.getUserFromToken
      >
    ).mockReturnValue({ userId: "u2", username: "ghost", roles: ["common"] });
    (
      userData.findUserById as MockedFunction<typeof userData.findUserById>
    ).mockReturnValue(undefined);

    await expect(service.getUserInfo("tok")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("authService.getRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("管理员返回完整路由（含两个 permission 子路由）", async () => {
    const service = createAuthService();
    (
      tokenManager.getUserFromToken as MockedFunction<
        typeof tokenManager.getUserFromToken
      >
    ).mockReturnValue({
      userId: "u1",
      username: "admin",
      roles: ["admin"],
    });

    const routes = await service.getRoutes("tok");

    // permission 下应包含两个子路由（page + button）
    const permission = routes.find((r) => r.path === "/permission");
    expect(permission?.children?.length).toBe(2);
  });

  it("普通用户返回受限路由（permission 只有一个子路由）", async () => {
    const service = createAuthService();
    (
      tokenManager.getUserFromToken as MockedFunction<
        typeof tokenManager.getUserFromToken
      >
    ).mockReturnValue({
      userId: "u1",
      username: "user",
      roles: ["common"],
    });

    const routes = await service.getRoutes("tok");

    const permission = routes.find((r) => r.path === "/permission");
    expect(permission?.children?.length).toBe(1);
  });

  it("token 无效时抛出 401", async () => {
    const service = createAuthService();
    (
      tokenManager.getUserFromToken as MockedFunction<
        typeof tokenManager.getUserFromToken
      >
    ).mockReturnValue(null);

    await expect(service.getRoutes("bad-token")).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
