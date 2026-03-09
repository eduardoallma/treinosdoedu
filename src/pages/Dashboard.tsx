import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Flame, TrendingUp, ChevronRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getWorkoutLogs, getTemplates } from "@/lib/storage";
import { WorkoutLog, WorkoutTemplate } from "@/types/gym";
import { format, isThisWeek, differenceInCalendarDays, startOfDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    getWorkoutLogs().then(setLogs);
    getTemplates().then(setTemplates);
  }, []);

  const weekStats = useMemo(() => {
    const thisWeekLogs = logs.filter((l) => isThisWeek(new Date(l.completedAt), { weekStartsOn: 1 }));
    const daysThisWeek = new Set(thisWeekLogs.map((l) => format(new Date(l.completedAt), "yyyy-MM-dd"))).size;
    const totalVolume = thisWeekLogs.reduce((sum, log) => {
      return sum + log.exercises.reduce((eSum, ex) => {
        return eSum + ex.sets.filter((s) => s.completed).reduce((sSum, s) => sSum + s.reps * s.weight, 0);
      }, 0);
    }, 0);
    return { daysThisWeek, totalVolume };
  }, [logs]);

  const streak = useMemo(() => {
    if (!logs.length) return 0;
    const uniqueDays = [...new Set(logs.map((l) => format(new Date(l.completedAt), "yyyy-MM-dd")))].sort().reverse();
    let count = 0;
    let expected = startOfDay(new Date());
    for (const day of uniqueDays) {
      const d = startOfDay(new Date(day));
      const diff = differenceInCalendarDays(expected, d);
      if (diff === 0 || diff === 1) {
        count++;
        expected = d;
      } else break;
    }
    return count;
  }, [logs]);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    logs.forEach((l) => l.exercises.forEach((e) => names.add(e.name)));
    return Array.from(names);
  }, [logs]);

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

  const lastWorkout = logs.length ? logs[logs.length - 1] : null;

  return (
    <PageShell title="Treinos do Edu">
      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { icon: Dumbbell, label: "Dias", value: weekStats.daysThisWeek },
          { icon: TrendingUp, label: "Volume (kg)", value: Math.round(weekStats.totalVolume).toLocaleString() },
          { icon: Flame, label: "Streak", value: streak },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-card p-4 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/workout")}
        className="mt-6 w-full rounded-xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
      >
        Iniciar Treino
      </button>

      {lastWorkout && (
        <button
          onClick={() => navigate("/history")}
          className="mt-6 flex w-full items-center justify-between rounded-xl bg-card p-4 text-left shadow-sm"
        >
          <div>
            <p className="text-xs text-muted-foreground">Último treino</p>
            <p className="mt-0.5 font-semibold">{lastWorkout.templateName}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(lastWorkout.completedAt), "EEEE, d MMM", { locale: ptBR })}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      {!templates.length && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Crie sua primeira ficha de treino para começar!</p>
          <button onClick={() => navigate("/templates")} className="mt-2 text-sm font-semibold text-primary">
            Criar Ficha →
          </button>
        </div>
      )}

      {/* Evolução */}
      {logs.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-base font-bold">Evolução</p>

          {/* Exercise selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {exerciseNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedExercise(name)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedExercise === name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {exerciseData.length > 0 && (
            <div className="mt-3 rounded-xl bg-card p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold">Carga Máxima (kg)</p>
              <ResponsiveContainer width="100%" height={180}>
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
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weeklyVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="volume" stroke="hsl(220 75% 55%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
