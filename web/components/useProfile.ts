"use client";

import { useCallback, useEffect, useState } from "react";
import { EMPTY_PROFILE, loadProfile, saveProfile, type Profile } from "@/lib/profile";

/** React hook backed by localStorage. Returns null on the server / before hydration. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...(prev ?? EMPTY_PROFILE), ...patch };
      saveProfile(next);
      return next;
    });
  }, []);

  const replace = useCallback((next: Profile) => {
    saveProfile(next);
    setProfile(next);
  }, []);

  return { profile, hydrated, update, replace };
}
