import { WorkoutTemplate, WorkoutLog } from "@/types/gym";
import { getActiveUser } from "./auth";

function userKey(base: string): string {
  const user = getActiveUser();
  return user ? `gymlog_${user}_${base}` : `gymlog_${base}`;
}

export function getTemplates(): WorkoutTemplate[] {
  const data = localStorage.getItem(userKey("templates"));
  return data ? JSON.parse(data) : [];
}

export function saveTemplates(templates: WorkoutTemplate[]) {
  localStorage.setItem(userKey("templates"), JSON.stringify(templates));
}

export function getWorkoutLogs(): WorkoutLog[] {
  const data = localStorage.getItem(userKey("logs"));
  return data ? JSON.parse(data) : [];
}

export function saveWorkoutLogs(logs: WorkoutLog[]) {
  localStorage.setItem(userKey("logs"), JSON.stringify(logs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
