// ====================
// 分类服务
// 提供分类ID到父分类+子分类ID的映射
// ====================

import { DEFAULT_CATEGORIES } from "@/lib/utils/constants";

export class CategoryService {
  // 核心接口：给定分类ID，返回当前分类及其所有子分类ID的数组
  // 这可以避免BookDB存储重复的分类ID逻辑，使分类扩展逻辑独立于数据库
  static resolveCategoryIds(categoryId: string): string[] {
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
    if (cat?.children && cat.children.length > 0) {
      return [categoryId, ...cat.children.map((sub) => sub.id)];
    }
    return [categoryId];
  }
}
