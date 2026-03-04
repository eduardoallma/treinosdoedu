import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Flame, TrendingUp, ChevronRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import { getWorkoutLogs, getTemplates } from "@/lib/storage";
import { format, isThisWeek, differenceInCalendarDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  const logs = getWorkoutLogs();
  const templates = getTemplates();

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

      {/* Quick Start */}
      <button
        onClick={() => navigate("/workout")}
        className="mt-6 w-full rounded-xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
      >
        Iniciar Treino
      </button>

      {/* Last Workout */}
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

      {/* No templates hint */}
      {!templates.length && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Crie sua primeira ficha de treino para começar!</p>
          <button onClick={() => navigate("/templates")} className="mt-2 text-sm font-semibold text-primary">
            Criar Ficha →
          </button>
        </div>
      )}
    </PageShell>
  );
}
