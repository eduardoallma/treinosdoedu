import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Minus } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getTemplates, getWorkoutLogs, saveWorkoutLog, generateId } from "@/lib/storage";
import { WorkoutTemplate, ExerciseLog, SetLog, WorkoutLog } from "@/types/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ActiveWorkout() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState("");
  const [startedAt] = useState(new Date().toISOString());

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

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
    updateSet(exIdx, setIdx, "completed", !exerciseLogs[exIdx].sets[setIdx].completed);
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
      startedAt,
      completedAt: new Date().toISOString(),
    };
    await saveWorkoutLog(log);
    navigate("/history");
  }

  const totalCompleted = exerciseLogs.reduce((s, e) => s + e.sets.filter((st) => st.completed).length, 0);
  const totalSets = exerciseLogs.reduce((s, e) => s + e.sets.length, 0);

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
