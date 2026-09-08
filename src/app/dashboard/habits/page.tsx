"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  useHabits,
  type UpdateHabitInput,
} from "@/hooks/useHabits";

import type {
  Habit,
} from "@/types/habits";

type ConfirmationAction = {
  type: "archive" | "delete";
  habit: Habit;
};

const iconOptions = [
  "🌱",
  "💧",
  "🏋️",
  "📚",
  "🧘",
  "🚶",
  "🥗",
  "💊",
  "🛏️",
  "🧹",
  "💻",
  "💰",
];

export default function HabitsPage() {
  // =================================
  // HABITS
  // =================================

  const {
    habits,
    archivedHabits,

    loading,
    loadingArchived,
    error,

    updatingHabitId,
    archivingHabitId,
    restoringHabitId,
    deletingHabitId,

    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,

    refreshArchivedHabits,
  } = useHabits();

  // =================================
  // EDIT
  // =================================

  const [
    editingHabit,
    setEditingHabit,
  ] = useState<Habit | null>(
    null,
  );

  const [
    form,
    setForm,
  ] =
    useState<UpdateHabitInput | null>(
      null,
    );

  const [
    formError,
    setFormError,
  ] =
    useState<string | null>(
      null,
    );

  // =================================
  // CONFIRMATION
  // =================================

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationAction | null>(
      null,
    );

  // =================================
  // ARCHIVED MODAL
  // =================================

  const [
    showArchived,
    setShowArchived,
  ] = useState(false);

  // =================================
  // OPEN EDIT
  // =================================

  const openEditModal = (
    habit: Habit,
  ) => {
    setEditingHabit(habit);

    setForm({
      title:
        habit.title,

      description:
        habit.description ??
        "",

      icon:
        habit.icon,

      frequency:
        habit.frequency,

      targetPerWeek:
        habit.target_per_week,
    });

    setFormError(null);
  };

  // =================================
  // CLOSE EDIT
  // =================================

  const closeEditModal =
    () => {
      if (
        updatingHabitId
      ) {
        return;
      }

      setEditingHabit(
        null,
      );

      setForm(null);

      setFormError(
        null,
      );
    };

  // =================================
  // UPDATE
  // =================================

  const handleUpdate =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !editingHabit ||
        !form
      ) {
        return;
      }

      const title =
        form.title.trim();

      if (
        title.length < 2
      ) {
        setFormError(
          "Enter a habit name with at least 2 characters.",
        );

        return;
      }

      setFormError(null);

      const updated =
        await updateHabit(
          editingHabit.id,
          {
            ...form,

            title,

            description:
              form.description.trim(),
          },
        );

      if (!updated) {
        setFormError(
          "Unable to update the habit. Please try again.",
        );

        return;
      }

      closeEditModal();
    };

  // =================================
  // CONFIRM ARCHIVE / DELETE
  // =================================

  const handleConfirmAction =
    async () => {
      if (
        !confirmation
      ) {
        return;
      }

      const {
        type,
        habit,
      } = confirmation;

      const succeeded =
        type === "archive"
          ? await archiveHabit(
              habit.id,
            )
          : await deleteHabit(
              habit.id,
            );

      if (succeeded) {
        setConfirmation(
          null,
        );
      }
    };

  // =================================
  // OPEN ARCHIVED
  // =================================

  const openArchived =
    async () => {
      setShowArchived(
        true,
      );

      await refreshArchivedHabits();
    };

  // =================================
  // RESTORE
  // =================================

  const handleRestore =
    async (
      habit: Habit,
    ) => {
      if (
        restoringHabitId ||
        deletingHabitId
      ) {
        return;
      }

      await restoreHabit(
        habit.id,
      );
    };

  // =================================
  // SUMMARY
  // =================================

  const completedCount =
    habits.filter(
      (habit) =>
        habit.completed_today,
    ).length;

  // =================================
  // RENDER
  // =================================

  return (
    <main className="min-h-screen bg-[#0c0c0f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              ← Back to dashboard
            </Link>

            <p className="mt-7 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
              Daily progress
            </p>

            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              🌱 Manage Habits
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Edit your routine,
              archive habits you may
              want later, or
              permanently remove
              habits you no longer
              need.
            </p>
          </div>

          {/* HEADER ACTIONS */}

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* ARCHIVED */}

            <button
              type="button"
              onClick={() => {
                void openArchived();
              }}
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-amber-400/20
                bg-amber-500/5
                px-4
                text-sm
                font-medium
                text-amber-200
                transition
                hover:bg-amber-500/10
              "
            >
              📦 Archived

              {archivedHabits.length >
                0 && (
                <span className="ml-2 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs">
                  {
                    archivedHabits.length
                  }
                </span>
              )}
            </button>

            {/* ADD HABIT */}

            <Link
              href="/dashboard"
              className="
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-purple-400/20
                bg-purple-500/10
                px-4
                text-sm
                font-medium
                text-purple-200
                transition
                hover:bg-purple-500/20
              "
            >
              + Add habit on dashboard
            </Link>
          </div>
        </header>

        {/* ================================= */}
        {/* SUMMARY */}
        {/* ================================= */}

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Active habits"
            value={String(
              habits.length,
            )}
            color="text-purple-300"
          />

          <SummaryCard
            label="Completed today"
            value={String(
              completedCount,
            )}
            color="text-emerald-300"
          />

          <SummaryCard
            label="Remaining today"
            value={String(
              Math.max(
                0,
                habits.length -
                  completedCount,
              ),
            )}
            color="text-amber-300"
            className="col-span-2 sm:col-span-1"
          />
        </section>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* ACTIVE HABITS */}
        {/* ================================= */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Your habits
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Manage all active
                habits.
              </p>
            </div>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
              {habits.length} active
            </span>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(
                (item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-2xl bg-white/5"
                  />
                ),
              )}
            </div>
          ) : habits.length ===
            0 ? (
            /* EMPTY */

            <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
              <div className="text-4xl">
                🌿
              </div>

              <h3 className="mt-4 font-medium">
                No active habits
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Create a habit from
                your dashboard to
                begin.
              </p>

              <button
                type="button"
                onClick={() => {
                  void openArchived();
                }}
                className="mt-4 text-sm text-amber-300 transition hover:text-amber-200"
              >
                📦 View archived
                habits
              </button>
            </div>
          ) : (
            /* HABITS */

            <div className="grid gap-3 lg:grid-cols-2">
              {habits.map(
                (habit) => {
                  const isBusy =
                    updatingHabitId ===
                      habit.id ||
                    archivingHabitId ===
                      habit.id ||
                    deletingHabitId ===
                      habit.id;

                  return (
                    <article
                      key={
                        habit.id
                      }
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/15 hover:bg-white/[0.035] sm:p-5"
                    >
                      {/* TOP */}

                      <div className="flex items-start gap-3">
                        {/* ICON */}

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                          {
                            habit.icon
                          }
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-zinc-100">
                              {
                                habit.title
                              }
                            </h3>

                            {habit.completed_today && (
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                                Completed
                              </span>
                            )}
                          </div>

                          <p className="mt-1 min-h-5 text-sm text-zinc-500">
                            {habit.description ||
                              "No description added."}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                            <span className="rounded-lg bg-white/5 px-2 py-1 capitalize">
                              {
                                habit.frequency
                              }
                            </span>

                            <span className="rounded-lg bg-white/5 px-2 py-1">
                              {
                                habit.target_per_week
                              }
                              × weekly
                            </span>

                            <span className="rounded-lg bg-white/5 px-2 py-1">
                              +
                              {
                                habit.xp_reward
                              }{" "}
                              XP
                            </span>

                            <span className="rounded-lg bg-white/5 px-2 py-1">
                              +
                              {
                                habit.coin_reward
                              }{" "}
                              coins
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              habit,
                            )
                          }
                          disabled={
                            isBusy
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✏️ Edit
                        </button>

                        {/* ARCHIVE */}

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmation(
                              {
                                type:
                                  "archive",

                                habit,
                              },
                            )
                          }
                          disabled={
                            isBusy
                          }
                          className="rounded-xl border border-amber-400/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-200 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {archivingHabitId ===
                          habit.id
                            ? "Archiving..."
                            : "📦 Archive"}
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmation(
                              {
                                type:
                                  "delete",

                                habit,
                              },
                            )
                          }
                          disabled={
                            isBusy
                          }
                          className="rounded-xl border border-red-400/15 bg-red-500/5 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingHabitId ===
                          habit.id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>

      {/* ================================= */}
      {/* ARCHIVED HABITS MODAL */}
      {/* ================================= */}

      {showArchived && (
        <div className="fixed inset-0 z-[240] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close archived habits"
            onClick={() => {
              setShowArchived(
                false,
              );
            }}
            className="absolute inset-0"
          />

          {/* MODAL */}

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archived-habits-title"
            className="
              relative
              z-10
              max-h-[85vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-3xl
              border
              border-white/10
              bg-[#18181d]
              p-5
              shadow-2xl
              sm:p-6
            "
          >
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
                  Saved for later
                </p>

                <h2
                  id="archived-habits-title"
                  className="mt-1 text-2xl font-semibold text-white"
                >
                  📦 Archived Habits
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Restore a habit
                  whenever you want
                  to use it again.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowArchived(
                    false,
                  );
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* LOADING */}

            {loadingArchived && (
              <div className="mt-6 space-y-3">
                {[0, 1, 2].map(
                  (item) => (
                    <div
                      key={
                        item
                      }
                      className="h-24 animate-pulse rounded-2xl bg-white/5"
                    />
                  ),
                )}
              </div>
            )}

            {/* EMPTY */}

            {!loadingArchived &&
              archivedHabits.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
                  <div className="text-4xl">
                    📦
                  </div>

                  <h3 className="mt-4 font-medium text-white">
                    No archived
                    habits
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Habits you
                    archive will
                    appear here.
                  </p>
                </div>
              )}

            {/* ARCHIVED HABITS */}

            {!loadingArchived &&
              archivedHabits.length >
                0 && (
                <div className="mt-6 space-y-3">
                  {archivedHabits.map(
                    (
                      habit,
                    ) => {
                      const restoring =
                        restoringHabitId ===
                        habit.id;

                      const deleting =
                        deletingHabitId ===
                        habit.id;

                      const busy =
                        restoring ||
                        deleting;

                      return (
                        <article
                          key={
                            habit.id
                          }
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"
                        >
                          {/* INFO */}

                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                              {
                                habit.icon
                              }
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-zinc-100">
                                {
                                  habit.title
                                }
                              </h3>

                              <p className="mt-1 text-sm text-zinc-500">
                                {habit.description ||
                                  "No description added."}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                                <span className="rounded-lg bg-white/5 px-2 py-1 capitalize">
                                  {
                                    habit.frequency
                                  }
                                </span>

                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                  {
                                    habit.target_per_week
                                  }
                                  × weekly
                                </span>

                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                  +
                                  {
                                    habit.xp_reward
                                  }{" "}
                                  XP
                                </span>

                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                  +
                                  {
                                    habit.coin_reward
                                  }{" "}
                                  coins
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}

                          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            {/* DELETE */}

                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() => {
                                setConfirmation(
                                  {
                                    type:
                                      "delete",

                                    habit,
                                  },
                                );
                              }}
                              className="rounded-xl border border-red-400/15 bg-red-500/5 px-4 py-2.5 text-sm text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleting
                                ? "Deleting..."
                                : "🗑️ Delete permanently"}
                            </button>

                            {/* RESTORE */}

                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() => {
                                void handleRestore(
                                  habit,
                                );
                              }}
                              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {restoring
                                ? "Restoring..."
                                : "↩ Restore"}
                            </button>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* EDIT HABIT MODAL */}
      {/* ================================= */}

      {editingHabit &&
        form && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
            {/* BACKDROP */}

            <button
              type="button"
              aria-label="Close edit modal"
              onClick={
                closeEditModal
              }
              className="absolute inset-0"
            />

            {/* MODAL */}

            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#18181d] p-5 shadow-2xl sm:p-6">
              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
                    Update routine
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    Edit habit
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEditModal
                  }
                  disabled={Boolean(
                    updatingHabitId,
                  )}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* FORM */}

              <form
                onSubmit={(
                  event,
                ) => {
                  void handleUpdate(
                    event,
                  );
                }}
                className="mt-6 space-y-4"
              >
                {/* NAME */}

                <label className="block">
                  <span className="text-sm text-zinc-300">
                    Habit name
                  </span>

                  <input
                    value={
                      form.title
                    }
                    onChange={(
                      event,
                    ) => {
                      setForm({
                        ...form,

                        title:
                          event
                            .target
                            .value,
                      });
                    }}
                    maxLength={
                      80
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-purple-400/40"
                  />
                </label>

                {/* DESCRIPTION */}

                <label className="block">
                  <span className="text-sm text-zinc-300">
                    Description
                  </span>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event,
                    ) => {
                      setForm({
                        ...form,

                        description:
                          event
                            .target
                            .value,
                      });
                    }}
                    rows={3}
                    maxLength={
                      240
                    }
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-purple-400/40"
                  />
                </label>

                {/* ICON */}

                <div>
                  <span className="text-sm text-zinc-300">
                    Icon
                  </span>

                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {iconOptions.map(
                      (
                        icon,
                      ) => (
                        <button
                          key={
                            icon
                          }
                          type="button"
                          onClick={() => {
                            setForm(
                              {
                                ...form,

                                icon,
                              },
                            );
                          }}
                          className={`flex aspect-square items-center justify-center rounded-xl border text-xl transition ${
                            form.icon ===
                            icon
                              ? "border-purple-400/40 bg-purple-500/15"
                              : "border-white/10 bg-black/20 hover:bg-white/5"
                          }`}
                        >
                          {
                            icon
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* FREQUENCY + TARGET */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-zinc-300">
                      Frequency
                    </span>

                    <select
                      value={
                        form.frequency
                      }
                      onChange={(
                        event,
                      ) => {
                        setForm(
                          {
                            ...form,

                            frequency:
                              event
                                .target
                                .value,
                          },
                        );
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                    >
                      <option value="daily">
                        Daily
                      </option>

                      <option value="weekdays">
                        Weekdays
                      </option>

                      <option value="weekly">
                        Weekly
                      </option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm text-zinc-300">
                      Target per
                      week
                    </span>

                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={
                        form.targetPerWeek
                      }
                      onChange={(
                        event,
                      ) => {
                        setForm(
                          {
                            ...form,

                            targetPerWeek:
                              Number(
                                event
                                  .target
                                  .value,
                              ),
                          },
                        );
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                    />
                  </label>
                </div>

                {/* ERROR */}

                {formError && (
                  <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                    {
                      formError
                    }
                  </p>
                )}

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeEditModal
                    }
                    disabled={Boolean(
                      updatingHabitId,
                    )}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={Boolean(
                      updatingHabitId,
                    )}
                    className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingHabitId
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ================================= */}
      {/* CONFIRMATION MODAL */}
      {/* ================================= */}

      {confirmation && (
        <ConfirmationModal
          action={
            confirmation
          }
          loading={
            archivingHabitId ===
              confirmation
                .habit.id ||
            deletingHabitId ===
              confirmation
                .habit.id
          }
          onCancel={() => {
            setConfirmation(
              null,
            );
          }}
          onConfirm={() => {
            void handleConfirmAction();
          }}
        />
      )}
    </main>
  );
}

// =================================
// CONFIRMATION MODAL
// =================================

function ConfirmationModal({
  action,
  loading,
  onCancel,
  onConfirm,
}: {
  action:
    ConfirmationAction;

  loading:
    boolean;

  onCancel:
    () => void;

  onConfirm:
    () => void;
}) {
  const isDelete =
    action.type ===
    "delete";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close confirmation"
        onClick={
          onCancel
        }
        disabled={
          loading
        }
        className="absolute inset-0"
      />

      {/* MODAL */}

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#18181d] shadow-2xl shadow-black/50">
        {/* TOP COLOR */}

        <div
          className={`h-1 w-full ${
            isDelete
              ? "bg-red-500"
              : "bg-amber-400"
          }`}
        />

        <div className="p-6 sm:p-7">
          {/* ICON */}

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl ${
              isDelete
                ? "border-red-400/20 bg-red-500/10"
                : "border-amber-400/20 bg-amber-500/10"
            }`}
          >
            {isDelete
              ? "🗑️"
              : "📦"}
          </div>

          {/* LABEL */}

          <p
            className={`mt-5 text-xs font-medium uppercase tracking-[0.18em] ${
              isDelete
                ? "text-red-300"
                : "text-amber-300"
            }`}
          >
            {isDelete
              ? "Permanent action"
              : "Move to archive"}
          </p>

          {/* TITLE */}

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {isDelete
              ? "Delete habit?"
              : "Archive habit?"}
          </h2>

          {/* DESCRIPTION */}

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {isDelete ? (
              <>
                <span className="font-medium text-zinc-200">
                  “
                  {
                    action
                      .habit
                      .title
                  }
                  ”
                </span>{" "}
                will be
                permanently
                removed. This
                action cannot be
                undone.
              </>
            ) : (
              <>
                <span className="font-medium text-zinc-200">
                  “
                  {
                    action
                      .habit
                      .title
                  }
                  ”
                </span>{" "}
                will leave your
                active list. You
                will be able to
                restore it from
                the archive
                later.
              </>
            )}
          </p>

          {/* ACTIONS */}

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                loading
              }
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                onConfirm
              }
              disabled={
                loading
              }
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDelete
                  ? "border-red-400/20 bg-red-500/80 hover:bg-red-500"
                  : "border-amber-400/20 bg-amber-500/80 hover:bg-amber-500"
              }`}
            >
              {loading
                ? isDelete
                  ? "Deleting..."
                  : "Archiving..."
                : isDelete
                  ? "Delete permanently"
                  : "Archive habit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =================================
// SUMMARY CARD
// =================================

function SummaryCard({
  label,
  value,
  color,
  className = "",
}: {
  label:
    string;

  value:
    string;

  color:
    string;

  className?:
    string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${className}`}
    >
      <p
        className={`text-2xl font-semibold ${color}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {label}
      </p>
    </div>
  );
}