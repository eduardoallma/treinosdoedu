import { supabaseExternal as supabase } from "@/lib/supabaseExternal";
import { getActiveUserId } from "./auth";
import { WorkoutTemplate, WorkoutLog, ExerciseTemplate, ExerciseLog } from "@/types/gym";

export function generateId(): string {
  return crypto.randomUUID();
}

// ---- Templates ----

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  const userId = getActiveUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    exercises: (row.exercises as unknown as ExerciseTemplate[]) ?? [],
    createdAt: row.created_at,
  }));
}

export async function saveTemplate(template: WorkoutTemplate): Promise<void> {
  const userId = getActiveUserId();
  if (!userId) return;

  await supabase.from("templates").upsert({
    id: template.id,
    user_id: userId,
    name: template.name,
    exercises: template.exercises as any,
    created_at: template.createdAt,
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await supabase.from("templates").delete().eq("id", id);
}

// ---- Workout Logs ----

export async function getWorkoutLogs(): Promise<WorkoutLog[]> {
  const userId = getActiveUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    templateId: row.template_id ?? "",
    templateName: row.template_name,
    exercises: (row.exercises as unknown as ExerciseLog[]) ?? [],
    notes: row.notes ?? "",
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
}

export async function saveWorkoutLog(log: WorkoutLog): Promise<void> {
  const userId = getActiveUserId();
  if (!userId) return;

  await supabase.from("workout_logs").upsert({
    id: log.id,
    user_id: userId,
    template_id: log.templateId,
    template_name: log.templateName,
    exercises: log.exercises as any,
    notes: log.notes,
    started_at: log.startedAt,
    completed_at: log.completedAt,
  });
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  await supabase.from("workout_logs").delete().eq("id", id);
}
