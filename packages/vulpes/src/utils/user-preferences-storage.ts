import { IUserPreferences } from "@/@dtos/Auth";

export const USER_PREFERENCES_STORAGE_KEY = "vulpes-user-preferences";

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function readStoredUserPreferences(): IUserPreferences {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as IUserPreferences;
  } catch {
    return {};
  }
}

export function writeStoredUserPreferences(preferences: IUserPreferences) {
  localStorage.setItem(
    USER_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
  notify();
}

export function clearStoredUserPreferences() {
  localStorage.removeItem(USER_PREFERENCES_STORAGE_KEY);
  notify();
}

export function subscribeStoredUserPreferences(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
