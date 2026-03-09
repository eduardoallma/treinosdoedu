import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2, Save, X, Plus, Minus } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getWorkoutLogs, getTemplates, saveWorkoutLog, deleteWorkoutLog } from "@/lib/storage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkoutLog, WorkoutTemplate, SetLog } from "@/types/gym";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<WorkoutLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getWorkoutLogs().then(setLogs);
    getTemplates().then(setTemplates);
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...logs].reverse();
    if (filter === "all") return sorted;
    return sorted.filter((l) => l.templateId === filter);
  }, [logs, filter]);

  const startEdit = (log: WorkoutLog) => {
    setEditingId(log.id);
    setEditDraft(JSON.parse(JSON.stringify(log)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!editDraft) return;
    await saveWorkoutLog(editDraft);
    setLogs(logs.map((l) => (l.id === editDraft.id ? editDraft : l)));
    setEditingId(null);
    setEditDraft(null);
    toast({ title: "Treino atualizado" });
  };

  const handleDelete = async (id: string) => {
    await deleteWorkoutLog(id);
    setLogs(logs.filter((l) => l.id !== id));
    setExpandedId(null);
    setEditingId(null);
    setEditDraft(null);
    toast({ title: "Treino excluído" });
  };

  const updateDraftSet = (exIdx: number, setIdx: number, field: keyof SetLog, value: number | boolean) => {
    if (!editDraft) return;
    const draft = { ...editDraft, exercises: editDraft.exercises.map((ex, ei) =>
      ei !== exIdx ? ex : { ...ex, sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: value }) }
    )};
    setEditDraft(draft);
  };

  const addDraftSet = (exIdx: number) => {
    if (!editDraft) return;
    const draft = { ...editDraft, exercises: editDraft.exercises.map((ex, ei) =>
      ei !== exIdx ? ex : { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, completed: true }] }
    )};
    setEditDraft(draft);
  };

  const removeDraftSet = (exIdx: number, setIdx: number) => {
    if (!editDraft) return;
    const draft = { ...editDraft, exercises: editDraft.exercises.map((ex, ei) =>
      ei !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
    )};
    setEditDraft(draft);
  };

  const isEditing = (id: string) => editingId === id;

  function toLocalDatetimeValue(isoString: string): string {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <PageShell title="Histórico">
      {/* Filter */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Todos
        </button>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {!filtered.length && <p className="mt-12 text-center text-sm text-muted-foreground">Nenhum treino registrado.</p>}

      <div className="mt-4 space-y-3">
        {filtered.map((log) => {
          const editing = isEditing(log.id);
          const data = editing && editDraft ? editDraft : log;

          return (
            <div key={log.id} className="rounded-xl bg-card p-4 shadow-sm">
              <button className="flex w-full items-center justify-between" onClick={() => { if (!editing) setExpandedId(expandedId === log.id ? null : log.id); }}>
                <div className="text-left">
                  <p className="font-semibold">{log.templateName}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(log.completedAt), "EEEE, d MMM · HH:mm", { locale: ptBR })}</p>
                </div>
                {!editing && (expandedId === log.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />)}
              </button>

              {(expandedId === log.id || editing) && (
                <div className="mt-3 space-y-3 border-t pt-3">
                  {!editing && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(log)} className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(log.id)} className="gap-1.5 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </Button>
                    </div>
                  )}

                  {data.exercises.map((ex, exIdx) => (
                    <div key={ex.exerciseId}>
                      <p className="text-sm font-medium">{ex.name}</p>
                      <div className="mt-1 space-y-1">
                        {editing && (
                          <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-[10px] text-muted-foreground px-0.5">
                            <span></span><span>Reps</span><span>Kg</span><span></span>
                          </div>
                        )}
                        {ex.sets.map((s, i) =>
                          editing ? (
                            <div key={i} className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2">
                              <span className="text-center text-xs text-muted-foreground">{i + 1}</span>
                              <Input type="number" min={0} value={s.reps} onChange={(e) => updateDraftSet(exIdx, i, "reps", +e.target.value)} className="h-8 text-center text-sm" />
                              <Input type="number" min={0} step={0.5} value={s.weight} onChange={(e) => updateDraftSet(exIdx, i, "weight", +e.target.value)} className="h-8 text-center text-sm" />
                              <button onClick={() => removeDraftSet(exIdx, i)} className="flex items-center justify-center text-muted-foreground hover:text-destructive">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div key={i} className={`flex gap-4 text-xs ${s.completed ? "text-foreground" : "text-muted-foreground line-through"}`}>
                              <span>Série {i + 1}</span>
                              <span>{s.reps} reps</span>
                              <span>{s.weight} kg</span>
                            </div>
                          )
                        )}
                        {editing && (
                          <button onClick={() => addDraftSet(exIdx)} className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                            <Plus className="h-3 w-3" /> Série
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {editing ? (
                    <textarea
                      value={editDraft?.notes ?? ""}
                      onChange={(e) => setEditDraft(editDraft ? { ...editDraft, notes: e.target.value } : null)}
                      placeholder="Observações..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      rows={2}
                    />
                  ) : (
                    data.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{data.notes}"</p>
                  )}

                  {editing && editDraft && (
                    <div className="space-y-2 border-t pt-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Início do treino</label>
                        <input
                          type="datetime-local"
                          value={toLocalDatetimeValue(editDraft.startedAt)}
                          onChange={(e) => setEditDraft({ ...editDraft, startedAt: new Date(e.target.value).toISOString() })}
                          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Conclusão do treino</label>
                        <input
                          type="datetime-local"
                          value={toLocalDatetimeValue(editDraft.completedAt)}
                          onChange={(e) => setEditDraft({ ...editDraft, completedAt: new Date(e.target.value).toISOString() })}
                          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                  )}

                  {editing && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={saveEdit} className="gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Salvar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit} className="gap-1.5">
                        <X className="h-3.5 w-3.5" /> Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
