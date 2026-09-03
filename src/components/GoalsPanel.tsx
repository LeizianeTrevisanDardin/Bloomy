"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useGoals,
} from "@/hooks/useGoals";

import type {
  CreateGoalInput,
  Goal,
  GoalCategory,
  GoalDifficulty,
  GoalUnit,
} from "@/types/goals";

type GoalsPanelProps = {
  onRewardsUpdated?:
    () => void | Promise<void>;
};

const iconOptions = [
  "🎯",
  "💼",
  "💰",
  "📚",
  "🏋️",
  "🏠",
  "✈️",
  "💻",
  "🌱",
  "🏆",
  "❤️",
  "⭐",
];

const difficultyOptions: {
  value: GoalDifficulty;
  label: string;
  reward: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    reward: "100 XP · 20 coins",
  },
  {
    value: "medium",
    label: "Medium",
    reward: "200 XP · 40 coins",
  },
  {
    value: "hard",
    label: "Hard",
    reward: "350 XP · 70 coins",
  },
];

const initialForm: CreateGoalInput = {
  title: "",
  description: "",
  icon: "🎯",
  category: "personal",
  targetValue: 100,
  currentValue: 0,
  unit: "percent",
  deadline: "",
  difficulty: "easy",
};

function getProgress(
  goal: Goal,
) {
  if (goal.target_value <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (goal.current_value /
        goal.target_value) *
        100,
    ),
  );
}

function formatValue(
  value: number,
  unit: GoalUnit,
) {
  if (unit === "percent") {
    return `${Math.round(
      value,
    )}%`;
  }

  if (unit === "dollars") {
    return new Intl.NumberFormat(
      "en-CA",
      {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      },
    ).format(value);
  }

  return `${value} ${unit}`;
}

export default function GoalsPanel({
  onRewardsUpdated,
}: GoalsPanelProps) {
  const {
    goals,
    loading,
    error,
    creatingGoal,
    updatingGoalId,
    createGoal,
    updateGoalProgress,
  } = useGoals();

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    progressGoal,
    setProgressGoal,
  ] = useState<Goal | null>(
    null,
  );

  const [
    progressValue,
    setProgressValue,
  ] = useState("");

  const [form, setForm] =
    useState<CreateGoalInput>(
      initialForm,
    );

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null,
  );

  const activeGoals =
    goals.filter(
      (goal) =>
        !goal.is_completed,
    ).length;

  // =================================
  // CREATE GOAL
  // =================================

  const handleCreateGoal =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const title =
        form.title.trim();

      if (title.length < 2) {
        setFormError(
          "Enter a goal name with at least 2 characters.",
        );

        return;
      }

      if (
        form.targetValue <= 0
      ) {
        setFormError(
          "Target value must be greater than zero.",
        );

        return;
      }

      if (
        form.currentValue < 0 ||
        form.currentValue >=
          form.targetValue
      ) {
        setFormError(
          "Current value must be lower than the target.",
        );

        return;
      }

      setFormError(null);

      const createdGoal =
        await createGoal({
          ...form,
          title,
          description:
            form.description.trim(),
        });

      if (!createdGoal) {
        setFormError(
          "Unable to create the goal. Please try again.",
        );

        return;
      }

      setShowCreateModal(false);
      setForm(initialForm);
    };

  // =================================
  // OPEN PROGRESS MODAL
  // =================================

  const openProgressModal = (
    goal: Goal,
  ) => {
    setProgressGoal(goal);

    setProgressValue(
      String(
        goal.current_value,
      ),
    );

    setFormError(null);
  };

  // =================================
  // UPDATE PROGRESS
  // =================================

  const handleUpdateProgress =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (!progressGoal) {
        return;
      }

      const newValue =
        Number(progressValue);

      if (
        Number.isNaN(
          newValue,
        ) ||
        newValue < 0
      ) {
        setFormError(
          "Enter a valid progress value.",
        );

        return;
      }

      setFormError(null);

      const result =
        await updateGoalProgress(
          progressGoal.id,
          newValue,
        );

      if (!result) {
        setFormError(
          "Unable to update progress.",
        );

        return;
      }

      if (
        result.rewardAwarded
      ) {
        await onRewardsUpdated?.();
      }

      setProgressGoal(null);
      setProgressValue("");
    };

  return (
    <>
      <section className="h-full min-h-[300px] rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
        {/* HEADER */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Long-term progress
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              🎯 Goals
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">
              {activeGoals} active
            </span>

            <button
              type="button"
              onClick={() => {
                setShowCreateModal(
                  true,
                );
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200"
            >
              + Add goal
            </button>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="h-[94px] animate-pulse rounded-2xl bg-white/5"
                />
              ),
            )}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          goals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center">
              <span className="text-3xl">
                🎯
              </span>

              <p className="mt-3 text-sm font-medium text-zinc-200">
                No goals yet
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Add your first goal to begin.
              </p>
            </div>
          )}

        {/* GOAL LIST */}

        {!loading &&
          !error &&
          goals.length > 0 && (
            <div className="space-y-3">
              {goals.map(
                (goal) => {
                  const progress =
                    getProgress(goal);

                  const updating =
                    updatingGoalId ===
                    goal.id;

                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => {
                        openProgressModal(
                          goal,
                        );
                      }}
                      disabled={
                        updating
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        goal.is_completed
                          ? "border-emerald-400/20 bg-emerald-400/5"
                          : "border-white/10 bg-black/10 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                            {
                              goal.icon
                            }
                          </span>

                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-medium ${
                                goal.is_completed
                                  ? "text-zinc-500 line-through"
                                  : "text-white"
                              }`}
                            >
                              {
                                goal.title
                              }
                            </p>

                            <p className="mt-1 text-[10px] capitalize text-zinc-500">
                              {
                                goal.category
                              }{" "}
                              ·{" "}
                              {
                                goal.difficulty
                              }
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 text-sm font-medium text-zinc-200">
                          {updating
                            ? "…"
                            : `${Math.round(
                                progress,
                              )}%`}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-[width] duration-500 ${
                            goal.is_completed
                              ? "bg-emerald-400"
                              : "bg-gradient-to-r from-purple-600 to-purple-400"
                          }`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-zinc-500">
                        <span>
                          {formatValue(
                            goal.current_value,
                            goal.unit,
                          )}{" "}
                          /{" "}
                          {formatValue(
                            goal.target_value,
                            goal.unit,
                          )}
                        </span>

                        <span>
                          +
                          {
                            goal.xp_reward
                          }{" "}
                          XP · 🪙
                          {
                            goal.coin_reward
                          }
                        </span>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
      </section>

      {/* ================================= */}
      {/* CREATE GOAL MODAL */}
      {/* ================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add goal form"
            onClick={() => {
              if (!creatingGoal) {
                setShowCreateModal(
                  false,
                );

                setFormError(
                  null,
                );
              }
            }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-goal-title"
            className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#17151d] p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-purple-300">
                  New achievement
                </p>

                <h2
                  id="create-goal-title"
                  className="mt-1 text-2xl font-semibold"
                >
                  Add a goal
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(
                    false,
                  );

                  setFormError(null);
                }}
                disabled={
                  creatingGoal
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(event) => {
                void handleCreateGoal(
                  event,
                );
              }}
              className="mt-6 space-y-5"
            >
              {/* TITLE */}

              <div>
                <label
                  htmlFor="goal-title"
                  className="text-sm text-zinc-200"
                >
                  Goal name
                </label>

                <input
                  id="goal-title"
                  required
                  autoFocus
                  maxLength={120}
                  value={form.title}
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
                  placeholder="Example: Launch my app"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="goal-description"
                  className="text-sm text-zinc-200"
                >
                  Description{" "}
                  <span className="text-zinc-500">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="goal-description"
                  rows={3}
                  maxLength={500}
                  value={
                    form.description
                  }
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
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                />
              </div>

              {/* ICONS */}

              <div>
                <p className="text-sm text-zinc-200">
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
                        className={`aspect-square rounded-xl border text-xl ${
                          form.icon ===
                          icon
                            ? "border-purple-400/50 bg-purple-400/15"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        {icon}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* CATEGORY AND UNIT */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="goal-category"
                    className="text-sm text-zinc-200"
                  >
                    Category
                  </label>

                  <select
                    id="goal-category"
                    value={
                      form.category
                    }
                    onChange={(event) => {
                      setForm(
                        (current) => ({
                          ...current,
                          category:
                            event.target
                              .value as GoalCategory,
                        }),
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#201e26] px-4 py-3 text-sm"
                  >
                    <option value="personal">
                      Personal
                    </option>
                    <option value="career">
                      Career
                    </option>
                    <option value="health">
                      Health
                    </option>
                    <option value="finance">
                      Finance
                    </option>
                    <option value="education">
                      Education
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="goal-unit"
                    className="text-sm text-zinc-200"
                  >
                    Unit
                  </label>

                  <select
                    id="goal-unit"
                    value={form.unit}
                    onChange={(event) => {
                      const unit =
                        event.target
                          .value as GoalUnit;

                      setForm(
                        (current) => ({
                          ...current,
                          unit,

                          targetValue:
                            unit ===
                            "percent"
                              ? 100
                              : current.targetValue,
                        }),
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#201e26] px-4 py-3 text-sm"
                  >
                    <option value="percent">
                      Percent
                    </option>
                    <option value="dollars">
                      Dollars
                    </option>
                    <option value="hours">
                      Hours
                    </option>
                    <option value="days">
                      Days
                    </option>
                    <option value="items">
                      Items
                    </option>
                  </select>
                </div>
              </div>

              {/* VALUES */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="goal-current"
                    className="text-sm text-zinc-200"
                  >
                    Current value
                  </label>

                  <input
                    id="goal-current"
                    type="number"
                    min={0}
                    step="0.01"
                    value={
                      form.currentValue
                    }
                    onChange={(event) => {
                      setForm(
                        (current) => ({
                          ...current,
                          currentValue:
                            Number(
                              event.target
                                .value,
                            ),
                        }),
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="goal-target"
                    className="text-sm text-zinc-200"
                  >
                    Target value
                  </label>

                  <input
                    id="goal-target"
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={
                      form.targetValue
                    }
                    disabled={
                      form.unit ===
                      "percent"
                    }
                    onChange={(event) => {
                      setForm(
                        (current) => ({
                          ...current,
                          targetValue:
                            Number(
                              event.target
                                .value,
                            ),
                        }),
                      );
                    }}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm disabled:text-zinc-500"
                  />
                </div>
              </div>

              {/* DEADLINE */}

              <div>
                <label
                  htmlFor="goal-deadline"
                  className="text-sm text-zinc-200"
                >
                  Deadline{" "}
                  <span className="text-zinc-500">
                    (optional)
                  </span>
                </label>

                <input
                  id="goal-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,
                        deadline:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#201e26] px-4 py-3 text-sm"
                />
              </div>

              {/* DIFFICULTY */}

              <div>
                <p className="text-sm text-zinc-200">
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
                        className={`rounded-xl border px-2 py-3 ${
                          form.difficulty ===
                          option.value
                            ? "border-purple-400/50 bg-purple-400/15 text-purple-200"
                            : "border-white/10 bg-black/20 text-zinc-400"
                        }`}
                      >
                        <span className="block text-sm">
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

              {formError && (
                <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(
                      false,
                    );

                    setFormError(
                      null,
                    );
                  }}
                  disabled={
                    creatingGoal
                  }
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingGoal
                  }
                  className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-medium disabled:opacity-60"
                >
                  {creatingGoal
                    ? "Creating..."
                    : "Create goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* UPDATE PROGRESS MODAL */}
      {/* ================================= */}

      {progressGoal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close progress form"
            onClick={() => {
              if (!updatingGoalId) {
                setProgressGoal(
                  null,
                );

                setFormError(
                  null,
                );
              }
            }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#17151d] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-purple-300">
              Update progress
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {progressGoal.icon}{" "}
              {progressGoal.title}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Target:{" "}
              {formatValue(
                progressGoal.target_value,
                progressGoal.unit,
              )}
            </p>

            <form
              onSubmit={(event) => {
                void handleUpdateProgress(
                  event,
                );
              }}
              className="mt-5"
            >
              <label
                htmlFor="progress-value"
                className="text-sm text-zinc-200"
              >
                Current value
              </label>

              <input
                id="progress-value"
                type="number"
                min={0}
                max={
                  progressGoal.target_value
                }
                step="0.01"
                autoFocus
                value={
                  progressValue
                }
                onChange={(event) => {
                  setProgressValue(
                    event.target.value,
                  );
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
              />

              {formError && (
                <p className="mt-3 text-xs text-red-300">
                  {formError}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProgressGoal(
                      null,
                    );

                    setFormError(
                      null,
                    );
                  }}
                  disabled={
                    Boolean(
                      updatingGoalId,
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    Boolean(
                      updatingGoalId,
                    )
                  }
                  className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-medium disabled:opacity-60"
                >
                  {updatingGoalId
                    ? "Saving..."
                    : "Save progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}