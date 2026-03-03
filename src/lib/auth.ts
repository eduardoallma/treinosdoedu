const ALLOWED_USERS = ["eduardo", "yuri", "matheus"];
const ACTIVE_USER_KEY = "gymlog_active_user";

export function getActiveUser(): string | null {
  return localStorage.getItem(ACTIVE_USER_KEY);
}

export function login(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  if (ALLOWED_USERS.includes(normalized)) {
    localStorage.setItem(ACTIVE_USER_KEY, normalized);
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}
