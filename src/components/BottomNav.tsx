import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, Dumbbell, Clock } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/templates", icon: ClipboardList, label: "Fichas" },
  { path: "/workout", icon: Dumbbell, label: "Treinar" },
  { path: "/history", icon: Clock, label: "Histórico" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className={active ? "font-semibold" : "font-normal"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
