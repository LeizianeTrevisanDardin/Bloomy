"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

import type {
  Profile,
} from "@/types/profile";

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

  const loadProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: userData,
          error: userError,
        } = await supabase.auth.getUser();

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

        if (profileError) {
          throw profileError;
        }

        setProfile(
          profileData as Profile,
        );
      } catch {
        setError(
          "Unable to load the profile.",
        );
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile: loadProfile,
  };
}