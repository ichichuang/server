import type { Context } from "hono";
import { encryptAndCompressSync } from "./safeStorage.js";

/**
 * 处理响应数据加密
 * 如果 data 中存在 isSafeStorage: true，则加密其他字段的值（保持key不变）
 * @param data 响应数据对象
 * @returns 处理后的数据对象
 */
export const processResponseData = <T extends Record<string, any>>(
  data: T
): T => {
  // 检查是否存在 isSafeStorage 且为 true
  if (data && typeof data === "object" && data.isSafeStorage === true) {
    try {
      // 创建新对象，保持原有key，只加密value
      const encryptedData: Record<string, any> = {
        isSafeStorage: true,
      };

      // 遍历所有字段，加密每个字段的值（除了 isSafeStorage）
      for (const key in data) {
        if (
          key !== "isSafeStorage" &&
          Object.prototype.hasOwnProperty.call(data, key)
        ) {
          const value = data[key];
          // 加密每个字段的值
          const encrypted = encryptAndCompressSync(value);
          if (encrypted) {
            encryptedData[key] = encrypted;
          } else {
            // 如果加密失败，保留原始值
            encryptedData[key] = value;
          }
        }
      }

      return encryptedData as unknown as T;
    } catch (error) {
      console.error("[ResponseEncrypt] 加密响应数据失败:", error);
    }
  }

  // 如果没有 isSafeStorage 或加密失败，返回原始数据
  return data;
};

/**
 * Hono 响应拦截器中间件
 * 在返回 JSON 响应前检查并加密数据
 */
export const encryptResponseMiddleware = async (
  c: Context,
  next: () => Promise<void>
) => {
  await next();

  // 只处理 JSON 响应
  const contentType = c.res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return;
  }

  try {
    // 获取原始响应体
    const originalResponse = c.res;
    const clonedResponse = originalResponse.clone();
    const json = await clonedResponse.json();

    // 检查是否有 data 字段且为对象
    if (
      json &&
      typeof json === "object" &&
      json.data &&
      typeof json.data === "object"
    ) {
      // 处理 data 字段
      const processedData = processResponseData(json.data);

      // 如果数据被处理了，创建新响应
      if (processedData !== json.data) {
        return c.json({
          ...json,
          data: processedData,
        });
      }
    }
  } catch (error) {
    // 如果处理失败，返回原始响应
    console.error("[ResponseEncrypt] 处理响应失败:", error);
  }
};
