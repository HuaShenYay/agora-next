// ====================
// 演示用户管理
// ====================

import type { User } from "@/lib/utils/types";

const DEMO_USERS: User[] = [
  {
    id: "demo-admin",
    username: "admin",
    displayName: "官方管理员",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-translator",
    username: "translator",
    displayName: "演示译者",
    role: "translator",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-viewer",
    username: "viewer",
    displayName: "访客",
    role: "viewer",
    createdAt: new Date().toISOString(),
  },
];

export function getUserById(id: string): User | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

export function getUserByUsername(username: string): User | undefined {
  return DEMO_USERS.find((u) => u.username === username);
}

export function getAllUsers(): User[] {
  return [...DEMO_USERS];
}
