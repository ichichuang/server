import crypto from "./crypto.js";
import lzstring from "./lzstring.js";
import { env } from "../config/env.js";

// 默认密钥：与前端保持一致，可通过环境变量覆盖
const DEFAULT_SECRET = env.appSecret;

/**
 * JSON 序列化 → LZ 压缩 → AES 加密
 */
export const encryptAndCompress = async <T>(
  value: T,
  secret: string = DEFAULT_SECRET
): Promise<string> => {
  try {
    const json = JSON.stringify(value);
    const compressed = lzstring.compress(json);
    if (!compressed) {
      return "";
    }
    const encrypted = await crypto.encrypt(compressed, secret);
    return encrypted || "";
  } catch (error) {
    console.warn("[safeStorage] encryptAndCompress 失败:", error);
    return "";
  }
};

/**
 * AES 解密 → LZ 解压 → JSON 反序列化
 */
export const decompressAndDecrypt = async <T>(
  encrypted: string,
  secret: string = DEFAULT_SECRET
): Promise<T | null> => {
  try {
    if (!encrypted) {
      return null;
    }
    const decrypted = await crypto.decrypt(encrypted, secret);
    if (!decrypted) {
      return null;
    }
    const decompressed = lzstring.decompress(decrypted);
    if (decompressed === null) {
      return null;
    }
    return JSON.parse(decompressed) as T;
  } catch (error) {
    console.warn("[safeStorage] decompressAndDecrypt 失败:", error);
    return null;
  }
};

/**
 * 同步版本：JSON 序列化 → LZ 压缩 → AES 同步加密
 */
export const encryptAndCompressSync = <T>(
  value: T,
  secret: string = DEFAULT_SECRET
): string => {
  try {
    const json = JSON.stringify(value);
    const compressed = lzstring.compress(json);
    if (!compressed) {
      return "";
    }
    const encrypted = crypto.encryptSync(compressed, secret);
    return encrypted || "";
  } catch (error) {
    console.warn("[safeStorage] encryptAndCompressSync 失败:", error);
    return "";
  }
};

/**
 * 同步版本：AES 同步解密 → LZ 解压 → JSON 反序列化
 */
export const decompressAndDecryptSync = <T>(
  encrypted: string,
  secret: string = DEFAULT_SECRET
): T | null => {
  try {
    if (!encrypted) {
      return null;
    }
    const decrypted = crypto.decryptSync(encrypted, secret);
    if (!decrypted) {
      return null;
    }
    const decompressed = lzstring.decompress(decrypted);
    if (decompressed === null) {
      return null;
    }
    return JSON.parse(decompressed) as T;
  } catch (error) {
    console.warn("[safeStorage] decompressAndDecryptSync 失败:", error);
    return null;
  }
};

export default {
  encryptAndCompress,
  decompressAndDecrypt,
  encryptAndCompressSync,
  decompressAndDecryptSync,
};
