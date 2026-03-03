import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import BottomNav from "./BottomNav";
import { getActiveUser, logout } from "@/lib/auth";

export default function PageShell({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  const navigate = useNavigate();
  const user = getActiveUser();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background/80 px-5 pb-2 pt-6 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {user && (
            <button onClick={handleLogout} className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <span className="capitalize">{user}</span>
              <LogOut className="h-3 w-3" />
            </button>
          )}
        </div>
        {action}
      </header>
      <main className="px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
