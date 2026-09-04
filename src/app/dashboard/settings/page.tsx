"use client";

import {
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useProfile } from "@/hooks/useProfiles";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/profiles";

export default function SettingsPage() {
  const {
    profile,
    loading,
    error,
    updatingProfile,
    uploadingAvatar,
    removingAvatar,
    updateDisplayName,
    uploadAvatar,
    removeAvatar,
  } = useProfile();

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#0c0c0f] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200">
            {error || "Unable to load your profile."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <SettingsContent
      key={`${profile.id}-${profile.updated_at}`}
      profile={profile}
      error={error}
      updatingProfile={updatingProfile}
      uploadingAvatar={uploadingAvatar}
      removingAvatar={removingAvatar}
      updateDisplayName={updateDisplayName}
      uploadAvatar={uploadAvatar}
      removeAvatar={removeAvatar}
    />
  );
}

function SettingsContent({
  profile,
  error,
  updatingProfile,
  uploadingAvatar,
  removingAvatar,
  updateDisplayName,
  uploadAvatar,
  removeAvatar,
}: {
  profile: Profile;
  error: string | null;
  updatingProfile: boolean;
  uploadingAvatar: boolean;
  removingAvatar: boolean;
  updateDisplayName: (displayName: string) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
  removeAvatar: () => Promise<boolean>;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(
    profile.display_name || "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const busy =
    updatingProfile || uploadingAvatar || removingAvatar;

  const saveName = async () => {
    setMessage(null);
    setActionError(null);

    const success = await updateDisplayName(displayName);

    if (success) {
      setMessage("Your display name was updated.");
    }
  };

  const selectAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setMessage(null);
    setActionError(null);

    const avatarUrl = await uploadAvatar(file);

    if (avatarUrl) {
      setMessage("Your profile photo was updated.");
    }
  };

  const deleteAvatar = async () => {
    setMessage(null);
    setActionError(null);

    const success = await removeAvatar();

    if (success) {
      setMessage("Your profile photo was removed.");
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;

    try {
      setDeletingAccount(true);
      setActionError(null);

      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Account deletion failed.");
      }

      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setActionError(
        "Unable to delete your account. Please try again.",
      );
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0c0c0f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            ← Back to dashboard
          </Link>

          <p className="mt-7 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
            Your account
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            ⚙️ Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Update your Bloomy profile and manage your account.
          </p>
        </header>

        {(error || actionError) && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {actionError || error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Profile
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Photo and display name
            </h2>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-purple-400/20 bg-purple-500/10 bg-cover bg-center text-5xl shadow-xl"
              style={
                profile.avatar_url
                  ? { backgroundImage: `url(${profile.avatar_url})` }
                  : undefined
              }
              role="img"
              aria-label="Profile photo"
            >
              {!profile.avatar_url && "👩🏻"}
            </div>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void selectAvatar(event)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="h-11 rounded-xl bg-purple-500 px-5 text-sm font-semibold transition hover:bg-purple-400 disabled:cursor-wait disabled:opacity-50"
              >
                {uploadingAvatar
                  ? "Optimizing and uploading..."
                  : profile.avatar_url
                    ? "Change photo"
                    : "Upload photo"}
              </button>

              {profile.avatar_url && (
                <button
                  type="button"
                  onClick={() => void deleteAvatar()}
                  disabled={busy}
                  className="h-11 rounded-xl border border-white/10 bg-white/5 px-5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-50"
                >
                  {removingAvatar ? "Removing..." : "Remove photo"}
                </button>
              )}

              <p className="w-full text-xs leading-5 text-zinc-500">
                JPG, PNG or WebP. Bloomy resizes and compresses the image
                before uploading it.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.07] pt-7">
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-zinc-300"
            >
              Display name
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={40}
                placeholder="Your name"
                className="h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10"
              />

              <button
                type="button"
                onClick={() => void saveName()}
                disabled={
                  updatingProfile ||
                  displayName.trim().length < 2 ||
                  displayName.trim() === (profile.display_name || "")
                }
                className="h-12 rounded-xl bg-purple-500 px-6 text-sm font-semibold transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updatingProfile ? "Saving..." : "Save name"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-red-400/15 bg-red-500/[0.04] p-5 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-300">
            Danger zone
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Delete account</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
                Permanently removes your account and its associated Bloomy
                data. This action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmation("");
                setShowDeleteModal(true);
              }}
              className="h-11 shrink-0 rounded-xl border border-red-400/25 bg-red-500/10 px-6 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            >
              Delete account
            </button>
          </div>
        </section>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingAccount) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-[#17151c] p-6 shadow-2xl sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
              ⚠️
            </div>

            <h2
              id="delete-account-title"
              className="mt-5 text-2xl font-semibold"
            >
              Delete your account?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Your profile, habits, tasks, goals and rewards will be
              permanently deleted. Type <strong className="text-red-200">DELETE</strong>{" "}
              to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              disabled={deletingAccount}
              autoFocus
              placeholder="Type DELETE"
              className="mt-5 h-12 w-full rounded-xl border border-red-400/20 bg-black/30 px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-500/10"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="h-11 rounded-xl border border-white/10 bg-white/5 px-5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void deleteAccount()}
                disabled={deleteConfirmation !== "DELETE" || deletingAccount}
                className="h-11 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingAccount
                  ? "Deleting account..."
                  : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SettingsSkeleton() {
  return (
    <main className="min-h-screen bg-[#0c0c0f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="h-4 w-36 rounded bg-white/10" />
        <div className="mt-10 h-10 w-52 rounded bg-white/10" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10" />
        <div className="mt-7 h-80 rounded-3xl bg-white/5" />
        <div className="mt-4 h-36 rounded-3xl bg-white/5" />
        <div className="mt-4 h-40 rounded-3xl bg-white/5" />
      </div>
    </main>
  );
}
