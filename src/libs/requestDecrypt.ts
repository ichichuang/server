import type { Context, Next } from "hono";
import { decompressAndDecryptSync } from "./safeStorage.js";

/**
 * 处理请求数据解密
 * 如果 data 中存在 isSafeStorage: true，则解密其他字段的值（保持key不变）
 * @param data 请求数据对象
 * @returns 处理后的数据对象
 */
export const processRequestData = <T extends Record<string, any>>(
  data: T
): T => {
  // 检查是否存在 isSafeStorage 且为 true
  if (data && typeof data === "object" && data.isSafeStorage === true) {
    try {
      // 创建新对象，保持原有key，只解密value
      const decryptedData: Record<string, any> = {};

      // 遍历所有字段，解密每个字段的值（除了 isSafeStorage）
      for (const key in data) {
        if (
          key !== "isSafeStorage" &&
          Object.prototype.hasOwnProperty.call(data, key)
        ) {
          const value = data[key];

          // 如果值是字符串，尝试解密
          if (typeof value === "string" && value) {
            try {
              const decrypted = decompressAndDecryptSync<any>(value);
              if (decrypted !== null) {
                decryptedData[key] = decrypted;
              } else {
                throw new Error(`解密字段 ${key} 失败：解密结果为 null`);
              }
            } catch (decryptError) {
              throw new Error(
                `解密字段 ${key} 失败: ${
                  decryptError instanceof Error
                    ? decryptError.message
                    : String(decryptError)
                }`
              );
            }
          } else {
            // 如果不是字符串，直接保留
            decryptedData[key] = value;
          }
        }
      }

      return decryptedData as T;
    } catch (error) {
      // 解密失败时抛出错误，而不是返回原始数据
      throw error;
    }
  }

  // 如果没有 isSafeStorage，返回原始数据
  return data;
};

/**
 * Hono 公共请求解密中间件（已废弃，解密逻辑集成到 validator 中）
 * 在所有请求处理之前自动解密请求数据（如果存在 isSafeStorage: true）
 * 解密后的数据会替换原始请求体，供后续所有中间件和路由使用
 *
 * @deprecated 此中间件已不再使用，解密逻辑已集成到 validator 中间件
 */
export const decryptRequestMiddleware = async (
  c: Context,
  next: Next
): Promise<void> => {
  // 只处理 JSON 请求（检查 Content-Type，支持 application/json 及其变体）
  const contentType = c.req.header("content-type") || "";

  // 检查是否是 JSON 请求（支持 application/json 及其带 charset 的变体）
  const isJsonRequest = contentType.toLowerCase().includes("application/json");

  if (!isJsonRequest) {
    await next();
    return;
  }

  try {
    // 读取请求体（使用 clone 避免消费原始请求）
    const clonedRequest = c.req.raw.clone();
    const body = await clonedRequest.json().catch(() => null);

    // 检查是否有 body 且为对象
    if (body && typeof body === "object") {
      // 处理请求数据解密
      const processedData = processRequestData(body);

      // 如果数据被解密了，需要重新设置到请求中
      if (processedData !== body) {
        // 创建新的请求对象，包含解密后的数据
        const newBody = JSON.stringify(processedData);
        const newRequest = new Request(c.req.raw.url, {
          method: c.req.raw.method,
          headers: c.req.raw.headers,
          body: newBody,
        });

        // 完全替换 context 中的请求对象，使用解密后的数据
        const originalReq = c.req;

        // 创建一个新的 req 对象，确保 json() 方法返回解密后的数据
        const newReq = {
          ...originalReq,
          raw: newRequest,
          json: async () => {
            return processedData;
          },
        };

        // 替换 context 中的 req
        (c as any).req = newReq;

        // 同时将解密后的数据存储到 context 中，作为备用
        (c as any).decryptedBody = processedData;
      }
    }

    await next();
  } catch (error) {
    throw error;
  }
};
