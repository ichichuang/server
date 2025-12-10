/**
 * Token 管理模块
 * 用于统一管理用户 token 和用户数据
 */

// Token 存储（实际应该使用 Redis 或数据库）
const tokens = new Map<string, { userId: string; username: string; roles: string[] }>()

/**
 * 生成简单的 token（实际应该使用 JWT）
 */
export function generateToken(userId: string, username: string, roles: string[]): string {
  const token = `token-${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`
  tokens.set(token, { userId, username, roles })
  return token
}

/**
 * 验证 token 并获取用户信息
 */
export function getUserFromToken(token: string | null): { userId: string; username: string; roles: string[] } | null {
  if (!token) return null
  return tokens.get(token) || null
}

/**
 * 从请求头获取 token
 */
export function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null

  // 支持 Bearer token 格式
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}

/**
 * 删除 token（用于登出）
 */
export function removeToken(token: string): void {
  tokens.delete(token)
}

/**
 * 清理所有 token（用于测试或维护）
 */
export function clearAllTokens(): void {
  tokens.clear()
}

