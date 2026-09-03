"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useTasks,
} from "@/hooks/useTasks";

import type {
  CreateTaskInput,
  Task,
  TaskDifficulty,
  TaskPriority,
} from "@/types/tasks";

type TasksPanelProps = {
  onRewardsUpdated?:
    () => void | Promise<void>;
};

const difficultyOptions: {
  value: TaskDifficulty;
  label: string;
  reward: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    reward: "30 XP · 5 coins",
  },
  {
    value: "medium",
    label: "Medium",
    reward: "50 XP · 10 coins",
  },
  {
    value: "hard",
    label: "Hard",
    reward: "80 XP · 15 coins",
  },
];

const initialForm: CreateTaskInput = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
  difficulty: "easy",
};

function getPriorityClass(
  priority: TaskPriority,
) {
  if (priority === "high") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  if (priority === "medium") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-sky-400/20 bg-sky-400/10 text-sky-300";
}

function formatDueDate(
  dueDate: string | null,
) {
  if (!dueDate) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      month: "short",
      day: "numeric",
    },
  ).format(
    new Date(
      `${dueDate}T12:00:00`,
    ),
  );
}

export default function TasksPanel({
  onRewardsUpdated,
}: TasksPanelProps) {
  const {
    tasks,
    loading,
    error,
    creatingTask,
    completingTaskId,
    uncompletingTaskId,
    createTask,
    completeTask,
    uncompleteTask,
  } = useTasks();

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [form, setForm] =
    useState<CreateTaskInput>(
      initialForm,
    );

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null,
  );

  const completedCount =
    tasks.filter(
      (task) => task.is_completed,
    ).length;

  // =================================
  // CLOSE MODAL
  // =================================

  const closeModal = () => {
    if (creatingTask) {
      return;
    }

    setShowCreateModal(false);
    setForm(initialForm);
    setFormError(null);
  };

  // =================================
  // CREATE TASK
  // =================================

  const handleCreateTask =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const title =
        form.title.trim();

      if (title.length < 2) {
        setFormError(
          "Enter a task name with at least 2 characters.",
        );

        return;
      }

      setFormError(null);

      const createdTask =
        await createTask({
          ...form,
          title,
          description:
            form.description.trim(),
        });

      if (!createdTask) {
        setFormError(
          "Unable to create the task. Please try again.",
        );

        return;
      }

      setShowCreateModal(false);
      setForm(initialForm);
    };

  // =================================
  // TOGGLE TASK
  // =================================

  const handleToggleTask =
    async (task: Task) => {
      if (
        completingTaskId ||
        uncompletingTaskId
      ) {
        return;
      }

      if (task.is_completed) {
        const result =
          await uncompleteTask(
            task.id,
          );

        if (
          result?.uncompleted ||
          result?.alreadyUncompleted
        ) {
          await onRewardsUpdated?.();
        }

        return;
      }

      const result =
        await completeTask(
          task.id,
        );

      if (
        result?.completed ||
        result?.alreadyCompleted
      ) {
        await onRewardsUpdated?.();
      }
    };

  return (
    <>
      <section className="h-full min-h-[300px] rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
        {/* HEADER */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Daily focus
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              📋 Today&apos;s Tasks
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">
              {completedCount} of{" "}
              {tasks.length}
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
              + Add task
            </button>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="space-y-2">
            {[0, 1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="h-[72px] animate-pulse rounded-2xl bg-white/5"
                />
              ),
            )}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          tasks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-8 text-center">
              <span className="text-3xl">
                📋
              </span>

              <p className="mt-3 text-sm font-medium text-zinc-200">
                No tasks yet
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Add your first task to begin.
              </p>
            </div>
          )}

        {/* TASK LIST */}

        {!loading &&
          !error &&
          tasks.length > 0 && (
            <div className="space-y-2">
              {tasks.map((task) => {
                const completing =
                  completingTaskId ===
                  task.id;

                const uncompleting =
                  uncompletingTaskId ===
                  task.id;

                const processing =
                  completing ||
                  uncompleting;

                const dueDate =
                  formatDueDate(
                    task.due_date,
                  );

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-3 transition ${
                      task.is_completed
                        ? "border-emerald-400/15 bg-emerald-400/5"
                        : "border-white/10 bg-black/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* COMPLETE BUTTON */}

                      <button
                        type="button"
                        onClick={() => {
                          void handleToggleTask(
                            task,
                          );
                        }}
                        disabled={
                          processing
                        }
                        title={
                          task.is_completed
                            ? "Click to undo"
                            : "Mark as completed"
                        }
                        aria-label={
                          task.is_completed
                            ? `Undo ${task.title}`
                            : `Complete ${task.title}`
                        }
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs transition ${
                          processing
                            ? "cursor-wait border-purple-400/30 bg-purple-400/10 text-purple-300"
                            : task.is_completed
                              ? "border-emerald-400/30 bg-emerald-500 text-black hover:border-amber-400/40 hover:bg-amber-400"
                              : "border-white/20 bg-white/5 text-transparent hover:border-emerald-400/40"
                        }`}
                      >
                        {processing
                          ? "…"
                          : task.is_completed
                            ? "✓"
                            : ""}
                      </button>

                      {/* INFORMATION */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={`truncate text-sm font-medium ${
                              task.is_completed
                                ? "text-zinc-500 line-through"
                                : "text-white"
                            }`}
                          >
                            {
                              task.title
                            }
                          </p>

                          <span className="shrink-0 text-xs font-medium text-yellow-300">
                            +
                            {
                              task.xp_reward
                            }{" "}
                            XP
                          </span>
                        </div>

                        {task.description && (
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {
                              task.description
                            }
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] capitalize ${getPriorityClass(
                              task.priority,
                            )}`}
                          >
                            {
                              task.priority
                            }
                          </span>

                          <span className="text-[10px] capitalize text-zinc-500">
                            {
                              task.difficulty
                            }
                          </span>

                          {dueDate && (
                            <span className="text-[10px] text-zinc-500">
                              📅{" "}
                              {dueDate}
                            </span>
                          )}

                          <span className="text-[10px] text-zinc-500">
                            🪙 +
                            {
                              task.coin_reward
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </section>

      {/* ================================= */}
      {/* CREATE TASK MODAL */}
      {/* ================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close add task form"
            onClick={closeModal}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-task-title"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#17151d] p-5 shadow-2xl sm:p-6"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
                  New focus
                </p>

                <h2
                  id="create-task-title"
                  className="mt-1 text-2xl font-semibold text-white"
                >
                  Add a task
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  creatingTask
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={(event) => {
                void handleCreateTask(
                  event,
                );
              }}
              className="mt-6 space-y-5"
            >
              {/* TITLE */}

              <div>
                <label
                  htmlFor="task-title"
                  className="text-sm font-medium text-zinc-200"
                >
                  Task name
                </label>

                <input
                  id="task-title"
                  type="text"
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
                  placeholder="Example: Finish project"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-400/40"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="task-description"
                  className="text-sm font-medium text-zinc-200"
                >
                  Description{" "}
                  <span className="font-normal text-zinc-500">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="task-description"
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
                  placeholder="Add task details..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-purple-400/40"
                />
              </div>

              {/* DUE DATE */}

              <div>
                <label
                  htmlFor="task-due-date"
                  className="text-sm font-medium text-zinc-200"
                >
                  Due date{" "}
                  <span className="font-normal text-zinc-500">
                    (optional)
                  </span>
                </label>

                <input
                  id="task-due-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => {
                    setForm(
                      (current) => ({
                        ...current,
                        dueDate:
                          event.target
                            .value,
                      }),
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#201e26] px-4 py-3 text-sm text-white outline-none focus:border-purple-400/40"
                />
              </div>

              {/* PRIORITY */}

              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Priority
                </p>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(
                    [
                      "low",
                      "medium",
                      "high",
                    ] as TaskPriority[]
                  ).map(
                    (priority) => (
                      <button
                        key={
                          priority
                        }
                        type="button"
                        onClick={() => {
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              priority,
                            }),
                          );
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm capitalize transition ${
                          form.priority ===
                          priority
                            ? getPriorityClass(
                                priority,
                              )
                            : "border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5"
                        }`}
                      >
                        {priority}
                      </button>
                    ),
                  )}
                </div>
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

              {/* ERROR */}

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
                    creatingTask
                  }
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-400 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingTask
                  }
                  className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-wait disabled:opacity-60"
                >
                  {creatingTask
                    ? "Creating..."
                    : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}