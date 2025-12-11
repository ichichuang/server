import { AppError } from "../errors/AppError.js";
import {
  findUserById,
  findUserByUsername,
  verifyPassword,
} from "../api/auth/userData.js";
import { generateToken, getUserFromToken } from "../libs/tokenManager.js";
import type {
  UserInfo,
  LoginResponse,
  BackendRouteConfig,
} from "../api/auth/types.js";

export interface AuthService {
  login: (username: string, password: string) => Promise<LoginResponse>;
  getUserInfo: (token: string | null) => Promise<UserInfo>;
  getRoutes: (token: string | null) => Promise<BackendRouteConfig[]>;
}

export const createAuthService = (): AuthService => {
  // 管理员路由配置
  const adminRoutes: BackendRouteConfig[] = [
    {
      path: "/user",
      name: "User",
      component: "user/index",
      meta: {
        titleKey: "router.user.title",
        icon: "ri-user-3-line",
        rank: 1,
      },
      children: [
        {
          path: "list",
          name: "UserList",
          component: "user/views/user-list",
          meta: {
            titleKey: "router.user.list.title",
            icon: "ri-user-3-line",
            rank: 1,
          },
        },
        {
          path: "permission",
          name: "UserPermission",
          component: "user/views/user-permission",
          meta: {
            titleKey: "router.user.permission.title",
            icon: "ri-user-3-line",
            rank: 2,
          },
        },
      ],
    },
    {
      path: "/permission",
      name: "Permission",
      component: "permission/index",
      meta: {
        titleKey: "router.permission.title",
        icon: "ri-building-2-line",
        rank: 2,
      },
      children: [
        {
          path: "page",
          name: "PermissionPage",
          component: "permission/views/permission-page",
          meta: {
            titleKey: "router.permission.page.title",
            roles: ["admin", "common"],
            icon: "ri-building-2-line",
          },
        },
        {
          path: "button",
          name: "PermissionButton",
          component: "permission/views/permission-button",
          meta: {
            titleKey: "router.permission.button.title",
            roles: ["admin"],
            auths: [
              "permission:btn:add",
              "permission:btn:edit",
              "permission:btn:delete",
            ],
            icon: "ri-building-2-line",
          },
        },
      ],
    },
  ];

  // 普通用户路由配置（只包含部分权限）
  const userRoutes: BackendRouteConfig[] = [
    {
      path: "/user",
      name: "User",
      component: "user/index",
      meta: {
        titleKey: "router.user.title",
        icon: "ri-user-3-line",
        rank: 1,
      },
      children: [
        {
          path: "list",
          name: "UserList",
          component: "user/views/user-list",
          meta: {
            titleKey: "router.user.list.title",
            icon: "ri-user-3-line",
            rank: 1,
          },
        },
      ],
    },
    {
      path: "/permission",
      name: "Permission",
      component: "permission/index",
      meta: {
        titleKey: "router.permission.title",
        icon: "ri-building-2-line",
        rank: 2,
      },
      children: [
        {
          path: "page",
          name: "PermissionPage",
          component: "permission/views/permission-page",
          meta: {
            titleKey: "router.permission.page.title",
            roles: ["admin", "common"],
            icon: "ri-building-2-line",
          },
        },
      ],
    },
  ];

  const getRoutesByRole = (roles: string[]): BackendRouteConfig[] => {
    if (roles.includes("admin")) {
      return adminRoutes;
    }
    return userRoutes;
  };

  const login = async (
    username: string,
    password: string
  ): Promise<LoginResponse> => {
    // 第一步：检查用户名是否存在
    const user = findUserByUsername(username);
    if (!user) {
      // 使用 400 而不是 401，避免触发前端自动登出
      // 401 应该用于已登录用户但 token 无效的情况
      throw AppError.badRequest("用户名不存在", "ERR_USER_NOT_FOUND");
    }

    // 第二步：检查密码是否正确
    if (!verifyPassword(user, password)) {
      throw AppError.badRequest("密码错误", "ERR_PASSWORD_INCORRECT");
    }

    // 登录成功，生成 token
    const token = generateToken(user.userId, user.username, user.roles);
    return {
      token,
      isSafeStorage: true,
    };
  };

  const getUserInfo = async (token: string | null): Promise<UserInfo> => {
    if (!token) {
      throw AppError.unauthorized("未提供认证 token");
    }

    const tokenData = getUserFromToken(token);
    if (!tokenData) {
      throw AppError.unauthorized("无效的 token");
    }

    const user = findUserById(tokenData.userId);
    if (!user) {
      throw AppError.notFound("用户不存在");
    }

    const { password, ...userInfo } = user;
    return userInfo;
  };

  const getRoutes = async (
    token: string | null
  ): Promise<BackendRouteConfig[]> => {
    if (!token) {
      throw AppError.unauthorized("未提供认证 token");
    }

    const tokenData = getUserFromToken(token);
    if (!tokenData) {
      throw AppError.unauthorized("无效的 token");
    }

    return getRoutesByRole(tokenData.roles);
  };

  return {
    login,
    getUserInfo,
    getRoutes,
  };
};
