/**
 * 认证相关类型定义
 * 与前端类型保持一致
 */

/**
 * 用户信息接口（与前端 UserInfo 保持一致）
 */
export interface UserInfo {
  /** 用户ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 用户角色 */
  roles: string[];
  /** 用户权限 */
  permissions: string[];
  /** 用户头像 */
  avatar?: string;
  /** 用户邮箱 */
  email?: string;
  /** 用户手机号 */
  phone?: string;
  /** 其他用户信息 */
  [key: string]: any;
}

/**
 * 路由元信息接口（与前端 RouteMeta 保持一致）
 */
export interface RouteMeta {
  /** 页面标题（优先使用 titleKey） */
  title?: string;
  /** 页面标题国际化 key（首选） */
  titleKey?: string;
  /** 布局模式 */
  parent?: "admin" | "fullscreen" | "ratio";
  /** 固定比例（只有ratio布局模式下有效：16:9） */
  ratio?: "16:9" | "4:3" | "1:1" | string;
  /** 父级菜单路径 */
  parentPaths?: string[];
  /** 菜单图标 */
  icon?: string;
  /** 是否在菜单中显示（默认 true） */
  showLink?: boolean;
  /** 菜单排序权重，数值越小越靠前 */
  rank?: number;
  /** 页面级权限角色 */
  roles?: string[];
  /** 按钮级权限设置 */
  auths?: string[];
  /** 是否缓存页面（默认 false） */
  keepAlive?: boolean;
  /** 是否隐藏面包屑（默认 false） */
  hideBreadcrumb?: boolean;
  /** 是否为外链 */
  isLink?: boolean;
  /** 外链地址 */
  linkUrl?: string;
  /** 激活菜单路径（用于参数路由） */
  activeMenu?: string;
  /** 页面描述信息 */
  description?: string;
  /** 是否为后端动态路由 */
  backstage?: boolean;
  /** 是否显示父级菜单 */
  showParent?: boolean;
  /** 内嵌的iframe链接 */
  frameSrc?: string;
  /** iframe页是否开启首次加载动画（默认true） */
  frameLoading?: boolean;
  /** 动态路由可打开的最大数量 */
  dynamicLevel?: number;
  /** 当前菜单名称或自定义信息禁止添加到标签页（默认false） */
  hiddenTag?: boolean;
  /** 当前菜单名称是否固定显示在标签页且不可关闭（默认false） */
  fixedTag?: boolean;
  /** 页面加载动画配置 */
  transition?: {
    /** 当前路由动画效果 */
    name?: string;
    /** 进场动画 */
    enterTransition?: string;
    /** 离场动画 */
    leaveTransition?: string;
  };
}

/**
 * 后端动态路由数据格式（与前端 BackendRouteConfig 保持一致）
 */
export interface BackendRouteConfig {
  /** 路由路径 */
  path: string;
  /** 路由名称 */
  name?: string;
  /** 组件路径（相对于src/views） */
  component?: string;
  /** 路由重定向 */
  redirect?: string;
  /** 路由元信息 */
  meta: RouteMeta;
  /** 子路由 */
  children?: BackendRouteConfig[];
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string;
  isSafeStorage: boolean;
}
