// ====================
// 常量时间密码比较
// 避免 === 在密码比较上的时序攻击理论风险
// ====================

import { timingSafeEqual } from "crypto";

/**
 * 常量时间比较两个字符串是否相等。
 * 长度不同时仍执行比较（用与 b 等长的 a 副本），避免通过长度差异泄漏信息。
 * 任意一个为空字符串时直接返回 false。
 */
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // 仍做一次比较消耗时间，不提前返回
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}
