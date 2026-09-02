"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useHabits,
} from "@/hooks/useHabits";

import type {
  CreateHabitInput,
  Habit,
  HabitDifficulty,
  HabitFrequency,
} from "@/types/habits";

type HabitsPanelProps = {
  onRewardsUpdated?:
    () => void | Promise<void>;
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

const difficultyOptions: {
  value: HabitDifficulty;
  label: string;
  reward: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    reward: "20 XP · 5 coins",
  },
  {
    value: "medium",
    label: "Medium",
    reward: "40 XP · 10 coins",
  },
  {
    value: "hard",
    label: "Hard",
    reward: "60 XP · 15 coins",
  },
];

const initialForm: CreateHabitInput = {
  title: "",
  description: "",
  icon: "🌱",
  frequency: "daily",
  targetPerWeek: 7,
  difficulty: "easy",
};

export default function HabitsPanel({
  onRewardsUpdated,
}: HabitsPanelProps) {
  const {
    habits,
    loading,
    error,
    creatingHabit,
    completingHabitId,
    uncompletingHabitId,
    createHabit,
    completeHabit,
    uncompleteHabit,
  } = useHabits();

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [form, setForm] =
    useState<CreateHabitInput>(
      initialForm,
    );

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null,
  );

  // =================================
  // CLOSE MODAL
  // =================================

  const closeModal = () => {
    if (creatingHabit) {
      return;
    }

    setShowCreateModal(false);
    setFormError(null);
    setForm(initialForm);
  };

  // =================================
  // CREATE HABIT
  // =================================

  const handleCreateHabit =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const title =
        form.title.trim();

      if (title.length < 2) {
        setFormError(
          "Enter a habit name with at least 2 characters.",
        );

        return;
      }

      setFormError(null);

      const createdHabit =
        await createHabit({
          ...form,
          title,
          description:
            form.description.trim(),
        });

      if (!createdHabit) {
        setFormError(
          "Unable to create the habit. Please try again.",
        );

        return;
      }

      setShowCreateModal(false);
      setForm(initialForm);
    };

  // =================================
  // COMPLETE HABIT
  // =================================

  const handleComplete =
    async (habit: Habit) => {
      if (
        habit.completed_today ||
        completingHabitId ===
          habit.id
      ) {
        return;
      }

      const result =
        await completeHabit(
          habit.id,
        );

      if (
        result?.completed ||
        result?.alreadyCompleted
      ) {
        await onRewardsUpdated?.();
      }
    };

  // =================================
  // UNCOMPLETE HABIT
  // =================================

  const handleUncomplete =
    async (habit: Habit) => {
      if (
        !habit.completed_today ||
        uncompletingHabitId ===
          habit.id
      ) {
        return;
      }

      const result =
        await uncompleteHabit(
          habit.id,
        );

      if (
        result?.uncompleted ||
        result?.alreadyUncompleted
      ) {
        await onRewardsUpdated?.();
      }
    };

  // =================================
  // TOGGLE HABIT
  // =================================

  const handleToggleHabit =
    async (habit: Habit) => {
      if (
        completingHabitId ||
        uncompletingHabitId
      ) {
        return;
      }

      if (habit.completed_today) {
        await handleUncomplete(
          habit,
        );

        return;
      }

      await handleComplete(
        habit,
      );
    };

  return (
    <>
      <section className="h-full rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Daily progress
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              🌱 Habits
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateModal(
                true,
              );
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200 sm:w-auto"
          >
            + Add habit
          </button>
        </div>

        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-white/10" />

                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-white/10" />

                      <div className="mt-2 h-3 w-48 max-w-full rounded bg-white/10" />
                    </div>

                    <div className="h-10 w-10 rounded-full bg-white/10" />
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-white/10" />
                </div>
              ),
            )}
          </div>
        )}

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
            <p className="text-sm text-red-300">
              {error}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Please refresh the page and try again.
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* EMPTY STATE */}
        {/* ================================= */}

        {!loading &&
          !error &&
          habits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center">
              <span className="text-3xl">
                🌱
              </span>

              <p className="mt-3 text-sm font-medium text-zinc-200">
                No habits yet
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Click Add habit to create your first habit.
              </p>
            </div>
          )}

        {/* ================================= */}
        {/* HABIT LIST */}
        {/* ================================= */}

        {!loading &&
          !error &&
          habits.length > 0 && (
            <div className="space-y-3">
              {habits.map(
                (habit) => {
                  const completed =
                    habit.completed_today;

                  const completing =
                    completingHabitId ===
                    habit.id;

                  const uncompleting =
                    uncompletingHabitId ===
                    habit.id;

                  const processing =
                    completing ||
                    uncompleting;

                  return (
                    <div
                      key={habit.id}
                      className={`group rounded-2xl border p-3 transition sm:p-4 ${
                        completed
                          ? "border-emerald-400/20 bg-emerald-400/5"
                          : "border-white/10 bg-black/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {/* ICON */}

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">
                            {
                              habit.icon
                            }
                          </div>

                          {/* INFORMATION */}

                          <div className="min-w-0">
                            <p
                              className={`truncate font-medium ${
                                completed
                                  ? "text-zinc-500 line-through"
                                  : "text-white"
                              }`}
                            >
                              {
                                habit.title
                              }
                            </p>

                            {habit.description && (
                              <p className="mt-0.5 truncate text-xs text-zinc-500">
                                {
                                  habit.description
                                }
                              </p>
                            )}

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                              <span className="capitalize">
                                {
                                  habit.frequency
                                }
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                +
                                {
                                  habit.xp_reward
                                }{" "}
                                XP
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                +
                                {
                                  habit.coin_reward
                                }{" "}
                                coins
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* TOGGLE BUTTON */}

                        <button
                          type="button"
                          onClick={() => {
                            void handleToggleHabit(
                              habit,
                            );
                          }}
                          disabled={
                            processing
                          }
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition ${
                            processing
                              ? "cursor-wait border-purple-400/30 bg-purple-400/10 text-purple-300"
                              : completed
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-amber-300"
                                : "border-white/15 bg-white/5 text-zinc-300 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                          }`}
                          aria-label={
                            completed
                              ? `Undo ${habit.title}`
                              : `Complete ${habit.title}`
                          }
                          title={
                            completed
                              ? "Click to undo"
                              : "Mark as completed"
                          }
                        >
                          {processing
                            ? "…"
                            : completed
                              ? "✓"
                              : ""}
                        </button>
                      </div>

                      {/* WEEKLY TARGET */}

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                          <span>
                            Weekly target
                          </span>

                          <span>
                            {
                              habit.target_per_week
                            }{" "}
                            days
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          {[
                            0,
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                          ].map(
                            (
                              day,
                            ) => {
                              const targetDay =
                                day <
                                Math.min(
                                  habit.target_per_week,
                                  7,
                                );

                              return (
                                <div
                                  key={
                                    day
                                  }
                                  className={`h-2 flex-1 rounded-full ${
                                    completed &&
                                    day ===
                                      0
                                      ? "bg-emerald-400"
                                      : targetDay
                                        ? "bg-purple-400/70"
                                        : "bg-white/10"
                                  }`}
                                />
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
      </section>

      {/* ================================= */}
      {/* CREATE HABIT MODAL */}
      {/* ================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close add habit form"
            onClick={closeModal}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* MODAL */}

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-habit-title"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#17151d] p-5 shadow-2xl sm:p-6"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
                  New routine
                </p>

                <h2
                  id="create-habit-title"
                  className="mt-1 text-2xl font-semibold text-white"
                >
                  Add a habit
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  creatingHabit
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={(event) => {
                void handleCreateHabit(
                  event,
                );
              }}
              className="mt-6 space-y-5"
            >
              {/* TITLE */}

              <div>
                <label
                  htmlFor="habit-title"
                  className="text-sm font-medium text-zinc-200"
                >
                  Habit name
                </label>

                <input
                  id="habit-title"
                  type="text"
                  value={form.title}
                  maxLength={80}
                  autoFocus
                  required
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,

                        title:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  placeholder="Example: Drink water"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/10"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="habit-description"
                  className="text-sm font-medium text-zinc-200"
                >
                  Description{" "}
                  <span className="font-normal text-zinc-500">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="habit-description"
                  value={
                    form.description
                  }
                  maxLength={240}
                  rows={3}
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,

                        description:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  placeholder="Add a small reminder..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/40 focus:ring-2 focus:ring-purple-400/10"
                />
              </div>

              {/* ICON */}

              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Icon
                </p>

                <div className="mt-2 grid grid-cols-6 gap-2">
                  {iconOptions.map(
                    (icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              icon,
                            }),
                          );
                        }}
                        className={`flex aspect-square items-center justify-center rounded-xl border text-xl transition ${
                          form.icon ===
                          icon
                            ? "border-purple-400/50 bg-purple-400/15"
                            : "border-white/10 bg-black/20 hover:bg-white/5"
                        }`}
                        aria-label={`Select ${icon}`}
                      >
                        {icon}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* FREQUENCY */}

              <div>
                <label
                  htmlFor="habit-frequency"
                  className="text-sm font-medium text-zinc-200"
                >
                  Frequency
                </label>

                <select
                  id="habit-frequency"
                  value={
                    form.frequency
                  }
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,

                        frequency:
                          event.target
                            .value as HabitFrequency,
                      }),
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#201e26] px-4 py-3 text-sm text-white outline-none focus:border-purple-400/40"
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
              </div>

              {/* WEEKLY TARGET */}

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="habit-target"
                    className="text-sm font-medium text-zinc-200"
                  >
                    Weekly target
                  </label>

                  <span className="text-sm text-purple-300">
                    {
                      form.targetPerWeek
                    }{" "}
                    days
                  </span>
                </div>

                <input
                  id="habit-target"
                  type="range"
                  min={1}
                  max={7}
                  value={
                    form.targetPerWeek
                  }
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,

                        targetPerWeek:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    );
                  }}
                  className="mt-3 w-full accent-purple-500"
                />
              </div>

              {/* DIFFICULTY */}

              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Difficulty
                </p>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {difficultyOptions.map(
                    (option) => (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() => {
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              difficulty:
                                option.value,
                            }),
                          );
                        }}
                        className={`rounded-xl border px-2 py-3 text-center transition ${
                          form.difficulty ===
                          option.value
                            ? "border-purple-400/50 bg-purple-400/15 text-purple-200"
                            : "border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5"
                        }`}
                      >
                        <span className="block text-sm font-medium">
                          {
                            option.label
                          }
                        </span>

                        <span className="mt-1 block text-[9px]">
                          {
                            option.reward
                          }
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* FORM ERROR */}

              {formError && (
                <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">
                  {formError}
                </p>
              )}

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    creatingHabit
                  }
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/5 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingHabit
                  }
                  className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-wait disabled:opacity-60"
                >
                  {creatingHabit
                    ? "Creating..."
                    : "Create habit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}