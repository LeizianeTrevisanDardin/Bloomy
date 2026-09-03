"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createClient,
} from "@/lib/supabase/client";

import type {
  Profile,
} from "@/types/profiles";

export function useProfile() {
  const [supabase] = useState(
    () => createClient(),
  );

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);
    
    const profileRequestId =
  useRef(0);

  const loadProfile =
  useCallback(async () => {
    const requestId =
      profileRequestId.current +
      1;

    profileRequestId.current =
      requestId;

    try {
      setLoading(true);
      setError(null);

      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      /*
       * Ignore an older request if another
       * profile refresh has already started.
       */
      if (
        requestId !==
        profileRequestId.current
      ) {
        return;
      }

      if (
        userError ||
        !userData.user
      ) {
        setProfile(null);

        setError(
          "User session not found.",
        );

        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          `
            id,
            display_name,
            avatar_url,
            level,
            xp,
            coins,
            gems,
            energy,
            created_at,
            updated_at
          `,
        )
        .eq(
          "id",
          userData.user.id,
        )
        .single();

      /*
       * Prevent an older response from
       * replacing newer XP and coins.
       */
      if (
        requestId !==
        profileRequestId.current
      ) {
        return;
      }

      if (profileError) {
        throw profileError;
      }

      setProfile(
        profileData as Profile,
      );
    } catch {
      if (
        requestId ===
        profileRequestId.current
      ) {
        setError(
          "Unable to load the profile.",
        );
      }
    } finally {
      if (
        requestId ===
        profileRequestId.current
      ) {
        setLoading(false);
      }
    }
  }, [supabase]);

  useEffect(() => {
  const timeoutId =
    window.setTimeout(() => {
      void loadProfile();
    }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile: loadProfile,
  };
}