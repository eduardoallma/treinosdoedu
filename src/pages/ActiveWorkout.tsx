import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Minus, X, Timer } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getTemplates, saveWorkoutLog, generateId } from "@/lib/storage";
import { WorkoutTemplate, ExerciseLog, SetLog, WorkoutLog } from "@/types/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const REST_SECONDS = 60;

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState("");
  const [startDatetime, setStartDatetime] = useState(toLocalDatetimeValue(new Date()));

  // Rest timer
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (restSeconds === null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    if (restSeconds <= 0) {
      setRestSeconds(null);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRestSeconds((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [restSeconds]);

  function startWorkout(t: WorkoutTemplate) {
    setSelectedTemplate(t);
    setExerciseLogs(
      t.exercises.map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: ex.suggestedWeight, completed: false })),
      }))
    );
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof SetLog, value: number | boolean) {
    const next = [...exerciseLogs];
    (next[exIdx].sets[setIdx] as any)[field] = value;
    setExerciseLogs(next);
  }

  function toggleSet(exIdx: number, setIdx: number) {
    const wasCompleted = exerciseLogs[exIdx].sets[setIdx].completed;
    updateSet(exIdx, setIdx, "completed", !wasCompleted);
    if (!wasCompleted) {
      // Set just completed → start rest timer
      setRestSeconds(REST_SECONDS);
    }
  }

  function addSet(exIdx: number) {
    const next = [...exerciseLogs];
    const lastSet = next[exIdx].sets[next[exIdx].sets.length - 1];
    next[exIdx].sets.push({ reps: lastSet?.reps ?? 12, weight: lastSet?.weight ?? 0, completed: false });
    setExerciseLogs(next);
  }

  function removeSet(exIdx: number) {
    const next = [...exerciseLogs];
    if (next[exIdx].sets.length > 1) next[exIdx].sets.pop();
    setExerciseLogs(next);
  }

  async function finishWorkout() {
    if (!selectedTemplate) return;
    const log: WorkoutLog = {
      id: generateId(),
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      exercises: exerciseLogs,
      notes,
      startedAt: new Date(startDatetime).toISOString(),
      completedAt: new Date().toISOString(),
    };
    await saveWorkoutLog(log);
    navigate("/history");
  }

  const totalCompleted = exerciseLogs.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0);
  const totalSets = exerciseLogs.reduce((s, e) => s + e.sets.length, 0);

  const restProgress = restSeconds !== null ? (restSeconds / REST_SECONDS) * 100 : 0;

  if (!selectedTemplate) {
    return (
      <PageShell title="Treinar">
        {!templates.length ? (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">Crie uma ficha primeiro para poder treinar.</p>
            <button onClick={() => navigate("/templates")} className="mt-2 text-sm font-semibold text-primary">
              Criar Ficha →
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Date/time selector */}
            <div className="rounded-xl bg-card p-4 shadow-sm">
              <label className="text-xs font-medium text-muted-foreground">Início do treino</label>
              <input
                type="datetime-local"
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <p className="text-sm text-muted-foreground">Selecione uma ficha para começar:</p>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => startWorkout(t)}
                className="flex w-full items-center justify-between rounded-xl bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
              >
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.exercises.length} exercício(s)</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell title={selectedTemplate.name}>
      {/* Progress */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalSets ? (totalCompleted / totalSets) * 100 : 0}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{totalCompleted}/{totalSets}</span>
      </div>

      {/* Rest Timer */}
      {restSeconds !== null && (
        <div className="mt-3 rounded-xl bg-primary/10 border border-primary/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Descanso</span>
            </div>
            <button
              onClick={() => setRestSeconds(null)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Pular
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold tabular-nums text-primary">
              {String(Math.floor(restSeconds / 60)).padStart(2, "0")}:{String(restSeconds % 60).padStart(2, "0")}
            </span>
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${restProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="mt-4 space-y-5">
        {exerciseLogs.map((ex, exIdx) => (
          <div key={ex.exerciseId} className="rounded-xl bg-card p-4 shadow-sm">
            <p className="mb-3 font-semibold">{ex.name}</p>
            <div className="mb-2 grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[10px] font-medium text-muted-foreground">
              <span>Série</span><span>Reps</span><span>Kg</span><span />
            </div>
            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="mb-2 grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2">
                <span className="text-center text-xs text-muted-foreground">{setIdx + 1}</span>
                <Input type="number" min={0} value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, "reps", +e.target.value)} className="h-9 text-center" />
                <Input type="number" min={0} step={0.5} value={set.weight} onChange={(e) => updateSet(exIdx, setIdx, "weight", +e.target.value)} className="h-9 text-center" />
                <button
                  onClick={() => toggleSet(exIdx, setIdx)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${set.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => addSet(exIdx)} className="flex items-center gap-1 text-xs text-primary"><Plus className="h-3.5 w-3.5" />Série</button>
              <button onClick={() => removeSet(exIdx)} className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="h-3.5 w-3.5" />Remover</button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <Textarea placeholder="Observações..." value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-4" rows={2} />

      {/* Finish */}
      <Button onClick={finishWorkout} className="mt-4 w-full" size="lg">
        Finalizar Treino
      </Button>
    </PageShell>
  );
}
