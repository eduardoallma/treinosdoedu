import { useState, useEffect, useMemo } from "react";
import PageShell from "@/components/PageShell";
import { getWorkoutLogs } from "@/lib/storage";
import { WorkoutLog } from "@/types/gym";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Progress() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    getWorkoutLogs().then(setLogs);
  }, []);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    logs.forEach((l) => l.exercises.forEach((e) => names.add(e.name)));
    return Array.from(names);
  }, [logs]);

  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    if (exerciseNames.length && !selectedExercise) {
      setSelectedExercise(exerciseNames[0]);
    }
  }, [exerciseNames, selectedExercise]);

  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];
    return logs
      .filter((l) => l.exercises.some((e) => e.name === selectedExercise))
      .map((l) => {
        const ex = l.exercises.find((e) => e.name === selectedExercise)!;
        const maxWeight = Math.max(...ex.sets.filter((s) => s.completed).map((s) => s.weight), 0);
        return { date: format(new Date(l.completedAt), "dd/MM"), weight: maxWeight };
      });
  }, [logs, selectedExercise]);

  const weeklyVolume = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach((l) => {
      const weekKey = format(startOfWeek(new Date(l.completedAt), { weekStartsOn: 1 }), "dd/MM");
      const vol = l.exercises.reduce((s, e) => s + e.sets.filter((st) => st.completed).reduce((ss, st) => ss + st.reps * st.weight, 0), 0);
      map.set(weekKey, (map.get(weekKey) ?? 0) + vol);
    });
    return Array.from(map, ([week, volume]) => ({ week, volume: Math.round(volume) }));
  }, [logs]);

  if (!logs.length) {
    return (
      <PageShell title="Evolução">
        <p className="mt-12 text-center text-sm text-muted-foreground">Complete treinos para ver sua evolução.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Evolução">
      <div className="mt-4">
        <label className="text-xs font-medium text-muted-foreground">Exercício</label>
        <div className="mt-1 flex gap-2 overflow-x-auto pb-2">
          {exerciseNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedExercise(name)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedExercise === name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {exerciseData.length > 0 && (
        <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold">Carga Máxima (kg)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={exerciseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {weeklyVolume.length > 0 && (
        <div className="mt-4 rounded-xl bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold">Volume Semanal (kg)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageShell>
  );
}
