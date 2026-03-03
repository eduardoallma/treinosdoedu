import { WorkoutTemplate, WorkoutLog } from "@/types/gym";

const TEMPLATES_KEY = "gymlog_templates";
const LOGS_KEY = "gymlog_logs";

export function getTemplates(): WorkoutTemplate[] {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTemplates(templates: WorkoutTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getWorkoutLogs(): WorkoutLog[] {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkoutLogs(logs: WorkoutLog[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
