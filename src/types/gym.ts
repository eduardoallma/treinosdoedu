export interface ExerciseTemplate {
  id: string;
  name: string;
  sets: number;
  reps: number;
  suggestedWeight: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
  createdAt: string;
}

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  templateId: string;
  templateName: string;
  exercises: ExerciseLog[];
  notes: string;
  startedAt: string;
  completedAt: string;
}
