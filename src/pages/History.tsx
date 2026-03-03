import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getWorkoutLogs, getTemplates } from "@/lib/storage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function History() {
  const logs = getWorkoutLogs();
  const templates = getTemplates();
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const sorted = [...logs].reverse();
    if (filter === "all") return sorted;
    return sorted.filter((l) => l.templateId === filter);
  }, [logs, filter]);

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
        {filtered.map((log) => (
          <div key={log.id} className="rounded-xl bg-card p-4 shadow-sm">
            <button className="flex w-full items-center justify-between" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
              <div className="text-left">
                <p className="font-semibold">{log.templateName}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(log.completedAt), "EEEE, d MMM · HH:mm", { locale: ptBR })}</p>
              </div>
              {expandedId === log.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expandedId === log.id && (
              <div className="mt-3 space-y-3 border-t pt-3">
                {log.exercises.map((ex) => (
                  <div key={ex.exerciseId}>
                    <p className="text-sm font-medium">{ex.name}</p>
                    <div className="mt-1 space-y-0.5">
                      {ex.sets.map((s, i) => (
                        <div key={i} className={`flex gap-4 text-xs ${s.completed ? "text-foreground" : "text-muted-foreground line-through"}`}>
                          <span>Série {i + 1}</span>
                          <span>{s.reps} reps</span>
                          <span>{s.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {log.notes && <p className="mt-2 text-xs text-muted-foreground italic">"{log.notes}"</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
