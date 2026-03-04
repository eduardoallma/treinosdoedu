import { supabase } from "@/integrations/supabase/client";

const ACTIVE_USER_KEY = "gymlog_active_user";
const ACTIVE_USER_ID_KEY = "gymlog_active_user_id";

export function getActiveUser(): string | null {
  return localStorage.getItem(ACTIVE_USER_KEY);
}

export function getActiveUserId(): string | null {
  return localStorage.getItem(ACTIVE_USER_ID_KEY);
}

export async function login(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  const { data, error } = await supabase
    .from("users")
    .select("id, username")
    .eq("username", normalized)
    .maybeSingle();

  if (error || !data) return false;

  localStorage.setItem(ACTIVE_USER_KEY, data.username);
  localStorage.setItem(ACTIVE_USER_ID_KEY, data.id);
  return true;
}

export function logout() {
  localStorage.removeItem(ACTIVE_USER_KEY);
  localStorage.removeItem(ACTIVE_USER_ID_KEY);
}
