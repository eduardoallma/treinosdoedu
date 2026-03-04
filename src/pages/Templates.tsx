import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, ChevronDown, ChevronUp, Edit2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getTemplates, saveTemplate, deleteTemplate, generateId } from "@/lib/storage";
import { WorkoutTemplate, ExerciseTemplate } from "@/types/gym";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Templates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  async function persist(next: WorkoutTemplate[]) {
    setTemplates(next);
  }

  function openNew() {
    setEditId(null);
    setName("");
    setExercises([{ id: generateId(), name: "", sets: 3, reps: 12, suggestedWeight: 0 }]);
    setDialogOpen(true);
  }

  function openEdit(t: WorkoutTemplate) {
    setEditId(t.id);
    setName(t.name);
    setExercises([...t.exercises]);
    setDialogOpen(true);
  }

  async function save() {
    if (!name.trim()) return;
    const cleaned = exercises.filter((e) => e.name.trim());
    if (!cleaned.length) return;

    if (editId) {
      const updated: WorkoutTemplate = { id: editId, name, exercises: cleaned, createdAt: templates.find(t => t.id === editId)?.createdAt ?? new Date().toISOString() };
      await saveTemplate(updated);
      setTemplates(templates.map((t) => (t.id === editId ? updated : t)));
    } else {
      const newTemplate: WorkoutTemplate = { id: generateId(), name, exercises: cleaned, createdAt: new Date().toISOString() };
      await saveTemplate(newTemplate);
      setTemplates([...templates, newTemplate]);
    }
    setDialogOpen(false);
  }

  async function duplicate(t: WorkoutTemplate) {
    const dup: WorkoutTemplate = {
      ...t,
      id: generateId(),
      name: `${t.name} (cópia)`,
      exercises: t.exercises.map((e) => ({ ...e, id: generateId() })),
      createdAt: new Date().toISOString(),
    };
    await saveTemplate(dup);
    setTemplates([...templates, dup]);
  }

  async function remove(id: string) {
    await deleteTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  }

  function addExercise() {
    setExercises([...exercises, { id: generateId(), name: "", sets: 3, reps: 12, suggestedWeight: 0 }]);
  }

  function updateExercise(idx: number, field: keyof ExerciseTemplate, value: string | number) {
    const next = [...exercises];
    (next[idx] as any)[field] = value;
    setExercises(next);
  }

  function removeExercise(idx: number) {
    setExercises(exercises.filter((_, i) => i !== idx));
  }

  return (
    <PageShell title="Fichas" action={<button onClick={openNew} className="rounded-full bg-primary p-2 text-primary-foreground"><Plus className="h-4 w-4" /></button>}>
      {!templates.length && (
        <p className="mt-12 text-center text-sm text-muted-foreground">Nenhuma ficha criada ainda.</p>
      )}

      <div className="mt-4 space-y-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-xl bg-card p-4 shadow-sm">
            <button className="flex w-full items-center justify-between" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
              <div className="text-left">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.exercises.length} exercício(s)</p>
              </div>
              {expandedId === t.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expandedId === t.id && (
              <div className="mt-3 space-y-2 border-t pt-3">
                {t.exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between text-sm">
                    <span>{ex.name}</span>
                    <span className="text-muted-foreground">{ex.sets}×{ex.reps} · {ex.suggestedWeight}kg</span>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => openEdit(t)} className="flex items-center gap-1 text-xs text-primary"><Edit2 className="h-3.5 w-3.5" /> Editar</button>
                  <button onClick={() => duplicate(t)} className="flex items-center gap-1 text-xs text-muted-foreground"><Copy className="h-3.5 w-3.5" /> Duplicar</button>
                  <button onClick={() => remove(t.id)} className="flex items-center gap-1 text-xs text-destructive"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Ficha" : "Nova Ficha"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome da ficha" value={name} onChange={(e) => setName(e.target.value)} />
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="space-y-2 rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Exercício" value={ex.name} onChange={(e) => updateExercise(idx, "name", e.target.value)} className="flex-1" />
                  <button onClick={() => removeExercise(idx)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Séries</label>
                    <Input type="number" min={1} value={ex.sets} onChange={(e) => updateExercise(idx, "sets", +e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Reps</label>
                    <Input type="number" min={1} value={ex.reps} onChange={(e) => updateExercise(idx, "reps", +e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Carga (kg)</label>
                    <Input type="number" min={0} value={ex.suggestedWeight} onChange={(e) => updateExercise(idx, "suggestedWeight", +e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addExercise} className="flex items-center gap-1 text-sm text-primary"><Plus className="h-4 w-4" /> Adicionar exercício</button>
            <Button onClick={save} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
