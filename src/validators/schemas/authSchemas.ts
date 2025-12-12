import { z } from "zod";

/**
 * 登录请求参数验证 Schema
 * 注意：登录接口不需要检查密码长度，只检查密码是否为空
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "用户名不能为空")
    // .max(50, "用户名长度不能超过50个字符")
    .trim(),

  password: z.string().min(1, "密码不能为空"),
  // 登录接口不需要检查密码长度
  // .min(6, "密码长度至少为6个字符")
  // .max(100, "密码长度不能超过100个字符")
});

/**
 * 从 Schema 推断 TypeScript 类型
 * 这样类型定义和验证规则保持同步
 */
export type LoginSchema = z.infer<typeof loginSchema>;

/**
 * 注册接口密码验证 Schema
 * 用于注册接口，需要检查密码长度和复杂度
 */
export const registerPasswordSchema = z
  .string()
  .min(1, "密码不能为空")
  .min(6, "密码长度至少为6个字符")
  .max(100, "密码长度不能超过100个字符");

/**
 * 注册请求参数验证 Schema
 * 注意：注册接口需要检查密码长度
 */
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "用户名不能为空")
    .max(50, "用户名长度不能超过50个字符")
    .trim(),
  password: registerPasswordSchema,
  // 可以根据需要添加其他字段，如 email、confirmPassword 等
});

/**
 * 可选：更严格的密码验证（包含复杂度要求）
 * 用于需要高安全性的场景
 */
export const strictPasswordSchema = z
  .string()
  .min(8, "密码长度至少为8个字符")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字")
  .regex(/[^A-Za-z0-9]/, "密码必须包含至少一个特殊字符");

/**
 * 如果需要更严格的登录验证，可以使用这个 Schema
 */
export const strictLoginSchema = z.object({
  username: loginSchema.shape.username,
  password: strictPasswordSchema,
});
