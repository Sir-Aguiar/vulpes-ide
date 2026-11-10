"use client";

import { IUserPreferences } from "@/@dtos/Auth";
import {
  readStoredUserPreferences,
  subscribeStoredUserPreferences,
} from "@/utils/user-preferences-storage";
import { useEffect, useState } from "react";

export function useStoredUserPreferences(): IUserPreferences {
  const [preferences, setPreferences] = useState<IUserPreferences>(() =>
    readStoredUserPreferences(),
  );

  useEffect(() => {
    setPreferences(readStoredUserPreferences());
    return subscribeStoredUserPreferences(() => {
      setPreferences(readStoredUserPreferences());
    });
  }, []);

  return preferences;
}
