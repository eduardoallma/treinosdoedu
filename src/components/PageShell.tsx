import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function PageShell({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background/80 px-5 pb-2 pt-6 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {action}
      </header>
      <main className="px-5">{children}</main>
      <BottomNav />
    </div>
  );
}
