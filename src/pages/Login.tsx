import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username)) {
      navigate("/", { replace: true });
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Dumbbell className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GymLog</h1>
          <p className="text-sm text-muted-foreground">Digite seu nome para entrar</p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Seu nome"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(false);
            }}
            autoFocus
            className="text-center"
          />
          {error && (
            <p className="text-sm text-destructive">Usuário não encontrado.</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!username.trim()}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
