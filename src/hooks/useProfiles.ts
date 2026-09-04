"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/profiles";

const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 0.82;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const acceptedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function useProfile() {
  const [supabase] = useState(() => createClient());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const profileRequestId = useRef(0);

  const loadProfile = useCallback(async () => {
    const requestId = profileRequestId.current + 1;
    profileRequestId.current = requestId;

    try {
      setLoading(true);
      setError(null);

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (requestId !== profileRequestId.current) return;

      if (userError || !userData.user) {
        setProfile(null);
        setError("User session not found.");
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
        .eq("id", userData.user.id)
        .single();

      if (requestId !== profileRequestId.current) return;

      if (profileError) throw profileError;

      setProfile(profileData as Profile);
    } catch {
      if (requestId === profileRequestId.current) {
        setError("Unable to load the profile.");
      }
    } finally {
      if (requestId === profileRequestId.current) {
        setLoading(false);
      }
    }
  }, [supabase]);

  // =================================
  // UPDATE DISPLAY NAME
  // =================================

  const updateDisplayName = useCallback(
    async (displayName: string): Promise<boolean> => {
      const normalizedName = displayName.trim();

      if (normalizedName.length < 2) {
        setError(
          "Display name must contain at least 2 characters.",
        );
        return false;
      }

      if (normalizedName.length > 50) {
        setError(
          "Display name cannot exceed 50 characters.",
        );
        return false;
      }

      try {
        setUpdatingProfile(true);
        setError(null);

        const { error: updateError } = await supabase.rpc(
          "update_profile_settings",
          {
            p_display_name: normalizedName,
            p_avatar_url: profile?.avatar_url ?? null,
          },
        );

        if (updateError) throw updateError;

        setProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                display_name: normalizedName,
                updated_at: new Date().toISOString(),
              }
            : currentProfile,
        );

        return true;
      } catch {
        setError("Unable to update your display name.");
        return false;
      } finally {
        setUpdatingProfile(false);
      }
    },
    [profile, supabase],
  );

  // =================================
  // UPLOAD AVATAR
  // =================================

  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      if (!acceptedImageTypes.includes(file.type)) {
        setError("Choose a JPG, PNG or WebP image.");
        return null;
      }

      if (file.size > MAX_UPLOAD_SIZE) {
        setError("The image must be smaller than 5 MB.");
        return null;
      }

      try {
        setUploadingAvatar(true);
        setError(null);

        // Compression and session lookup happen together to reduce latency.
        const [optimizedAvatar, userResult] = await Promise.all([
          optimizeAvatar(file),
          supabase.auth.getUser(),
        ]);

        if (userResult.error || !userResult.data.user) {
          throw new Error("User session not found.");
        }

        const userId = userResult.data.user.id;
        const avatarPath = `${userId}/avatar.webp`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(avatarPath, optimizedAvatar, {
            contentType: "image/webp",
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarPath);

        // Cache-busting displays the new image immediately.
        const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

        const { error: profileError } = await supabase.rpc(
          "update_profile_settings",
          {
            p_display_name:
              profile?.display_name || "Bloomy User",
            p_avatar_url: avatarUrl,
          },
        );

        if (profileError) throw profileError;

        setProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
              }
            : currentProfile,
        );

        return avatarUrl;
      } catch {
        setError("Unable to upload your profile photo.");
        return null;
      } finally {
        setUploadingAvatar(false);
      }
    },
    [profile, supabase],
  );

  // =================================
  // REMOVE AVATAR
  // =================================

  const removeAvatar = useCallback(async (): Promise<boolean> => {
    try {
      setRemovingAvatar(true);
      setError(null);

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("User session not found.");
      }

      const avatarPath = `${userData.user.id}/avatar.webp`;

      const [removeResult, profileResult] = await Promise.all([
        supabase.storage.from("avatars").remove([avatarPath]),
        supabase.rpc("update_profile_settings", {
          p_display_name:
            profile?.display_name || "Bloomy User",
          p_avatar_url: null,
        }),
      ]);

      if (removeResult.error) throw removeResult.error;
      if (profileResult.error) throw profileResult.error;

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              avatar_url: null,
              updated_at: new Date().toISOString(),
            }
          : currentProfile,
      );

      return true;
    } catch {
      setError("Unable to remove your profile photo.");
      return false;
    } finally {
      setRemovingAvatar(false);
    }
  }, [profile, supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    updatingProfile,
    uploadingAvatar,
    removingAvatar,
    updateDisplayName,
    uploadAvatar,
    removeAvatar,
    refreshProfile: loadProfile,
  };
}

async function optimizeAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    AVATAR_SIZE / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Image processing is unavailable.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to optimize the image."));
        }
      },
      "image/webp",
      AVATAR_QUALITY,
    );
  });
}
