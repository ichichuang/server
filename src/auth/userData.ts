/**
 * 用户数据模块
 * 统一管理用户数据（实际应该使用数据库）
 */

import type { UserInfo } from "./types.js";

/**
 * 用户数据接口（包含密码，内部使用）
 */
export interface User extends UserInfo {
  password: string;
}

// 用户数据
export const users: User[] = [
  {
    userId: "1",
    username: "admin",
    password: "123456", // 实际应该加密存储
    roles: ["admin"],
    permissions: ["read", "write", "delete"],
    email: "admin@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    phone: "12345678901",
  },
  {
    userId: "2",
    username: "test",
    password: "123456", // 实际应该加密存储
    roles: ["user"],
    permissions: ["read"],
    email: "test@example.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    phone: "12345678902",
  },
];

/**
 * 根据用户名查找用户
 */
export function findUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username);
}

/**
 * 根据用户ID查找用户
 */
export function findUserById(userId: string): User | undefined {
  return users.find((u) => u.userId === userId);
}

/**
 * 验证用户密码
 */
export function verifyPassword(user: User, password: string): boolean {
  return user.password === password;
}
