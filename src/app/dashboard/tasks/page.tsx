"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  useTasks,
  type UpdateTaskInput,
} from "@/hooks/useTasks";
import type {
  Task,
  TaskDifficulty,
  TaskPriority,
} from "@/types/tasks";

type ConfirmationAction = {
  type: "archive" | "delete";
  task: Task;
};

const difficultyRewards: Record<
  TaskDifficulty,
  string
> = {
  easy: "30 XP · 5 coins",
  medium: "50 XP · 10 coins",
  hard: "80 XP · 15 coins",
};

export default function TasksPage() {
  const {
    tasks,
    loading,
    error,
    updatingTaskId,
    archivingTaskId,
    deletingTaskId,
    updateTask,
    archiveTask,
    deleteTask,
  } = useTasks();

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);
  const [form, setForm] =
    useState<UpdateTaskInput | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<ConfirmationAction | null>(null);

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      dueDate: task.due_date ?? "",
      priority: task.priority,
      difficulty: task.difficulty,
    });
    setFormError(null);
  };

  const closeEditModal = () => {
    if (updatingTaskId) return;

    setEditingTask(null);
    setForm(null);
    setFormError(null);
  };

  const handleUpdate = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingTask || !form) return;

    const title = form.title.trim();

    if (title.length < 2) {
      setFormError(
        "Enter a task name with at least 2 characters.",
      );
      return;
    }

    setFormError(null);

    const updated = await updateTask(editingTask.id, {
      ...form,
      title,
      description: form.description.trim(),
    });

    if (!updated) {
      setFormError(
        "Unable to update the task. Please try again.",
      );
      return;
    }

    closeEditModal();
  };

  const handleConfirmAction = async () => {
    if (!confirmation) return;

    const { type, task } = confirmation;

    const succeeded =
      type === "archive"
        ? await archiveTask(task.id)
        : await deleteTask(task.id);

    if (succeeded) {
      setConfirmation(null);
    }
  };

  const completedCount = tasks.filter(
    (task) => task.is_completed,
  ).length;
  const pendingCount = tasks.length - completedCount;

  const overdueCount = tasks.filter((task) => {
    if (!task.due_date || task.is_completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${task.due_date}T00:00:00`);
    return dueDate < today;
  }).length;

  return (
    <main className="min-h-screen bg-[#0c0c0f] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              ← Back to dashboard
            </Link>

            <p className="mt-7 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
              Daily focus
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              📋 Manage Tasks
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Update your tasks, change their priority and
              difficulty, archive them for later, or permanently
              remove them.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"
          >
            + Add task on dashboard
          </Link>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Pending tasks"
            value={String(pendingCount)}
            color="text-purple-300"
          />
          <SummaryCard
            label="Completed"
            value={String(completedCount)}
            color="text-emerald-300"
          />
          <SummaryCard
            label="Overdue"
            value={String(overdueCount)}
            color="text-red-300"
            className="col-span-2 sm:col-span-1"
          />
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Your tasks</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Manage all non-archived tasks.
              </p>
            </div>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
              {tasks.length} total
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white/5"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
              <div className="text-4xl">📋</div>
              <h3 className="mt-4 font-medium">No tasks yet</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Create a task from your dashboard to begin.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {tasks.map((task) => {
                const isBusy =
                  updatingTaskId === task.id ||
                  archivingTaskId === task.id ||
                  deletingTaskId === task.id;

                return (
                  <article
                    key={task.id}
                    className={`rounded-2xl border p-4 transition sm:p-5 ${
                      task.is_completed
                        ? "border-emerald-400/15 bg-emerald-500/[0.04]"
                        : "border-white/10 bg-black/20 hover:border-white/15 hover:bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl ${
                          task.is_completed
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        {task.is_completed ? "✓" : "📄"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-medium ${
                              task.is_completed
                                ? "text-zinc-500 line-through"
                                : "text-zinc-100"
                            }`}
                          >
                            {task.title}
                          </h3>

                          {task.is_completed && (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="mt-1 min-h-5 text-sm text-zinc-500">
                          {task.description || "No description added."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                          <span
                            className={`rounded-lg border px-2 py-1 capitalize ${getPriorityClass(
                              task.priority,
                            )}`}
                          >
                            {task.priority} priority
                          </span>
                          <span className="rounded-lg bg-white/5 px-2 py-1 capitalize">
                            {task.difficulty}
                          </span>
                          {task.due_date && (
                            <span className="rounded-lg bg-white/5 px-2 py-1">
                              📅 {formatDueDate(task.due_date)}
                            </span>
                          )}
                          <span className="rounded-lg bg-white/5 px-2 py-1">
                            +{task.xp_reward} XP
                          </span>
                          <span className="rounded-lg bg-white/5 px-2 py-1">
                            +{task.coin_reward} coins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        disabled={isBusy}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmation({ type: "archive", task })
                        }
                        disabled={isBusy}
                        className="rounded-xl border border-amber-400/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-200 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {archivingTaskId === task.id
                          ? "Archiving..."
                          : "📦 Archive"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmation({ type: "delete", task })
                        }
                        disabled={isBusy}
                        className="rounded-xl border border-red-400/15 bg-red-500/5 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingTaskId === task.id
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {editingTask && form && (
        <EditTaskModal
          form={form}
          formError={formError}
          loading={updatingTaskId === editingTask.id}
          setForm={setForm}
          onClose={closeEditModal}
          onSubmit={(event) => void handleUpdate(event)}
        />
      )}

      {confirmation && (
        <ConfirmationModal
          action={confirmation}
          loading={
            archivingTaskId === confirmation.task.id ||
            deletingTaskId === confirmation.task.id
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void handleConfirmAction()}
        />
      )}
    </main>
  );
}

function EditTaskModal({
  form,
  formError,
  loading,
  setForm,
  onClose,
  onSubmit,
}: {
  form: UpdateTaskInput;
  formError: string | null;
  loading: boolean;
  setForm: (form: UpdateTaskInput) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close edit modal"
        onClick={onClose}
        disabled={loading}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#18181d] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Update your plan
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Edit task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-300">Task name</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              maxLength={100}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-purple-400/40"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              rows={3}
              maxLength={300}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-purple-400/40"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Due date</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                setForm({ ...form, dueDate: event.target.value })
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm outline-none focus:border-purple-400/40"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-zinc-300">Priority</span>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value as TaskPriority,
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm outline-none focus:border-purple-400/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-zinc-300">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(event) =>
                  setForm({
                    ...form,
                    difficulty: event.target.value as TaskDifficulty,
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm outline-none focus:border-purple-400/40"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-purple-400/10 bg-purple-500/5 p-3 text-xs text-purple-200">
            Reward: {difficultyRewards[form.difficulty]}
          </div>

          {formError && (
            <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmationModal({
  action,
  loading,
  onCancel,
  onConfirm,
}: {
  action: ConfirmationAction;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action.type === "delete";

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={onCancel}
        disabled={loading}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#18181d] shadow-2xl shadow-black/50">
        <div
          className={`h-1 ${isDelete ? "bg-red-500" : "bg-amber-400"}`}
        />
        <div className="p-6 sm:p-7">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl ${
              isDelete
                ? "border-red-400/20 bg-red-500/10"
                : "border-amber-400/20 bg-amber-500/10"
            }`}
          >
            {isDelete ? "🗑️" : "📦"}
          </div>

          <p
            className={`mt-5 text-xs font-medium uppercase tracking-[0.18em] ${
              isDelete ? "text-red-300" : "text-amber-300"
            }`}
          >
            {isDelete ? "Permanent action" : "Move to archive"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isDelete ? "Delete task?" : "Archive task?"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            <span className="font-medium text-zinc-200">
              “{action.task.title}”
            </span>{" "}
            {isDelete
              ? "will be permanently removed. This action cannot be undone."
              : "will leave your active list. You will be able to restore it from the archive later."}
          </p>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${
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
                  : "Archive task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  className = "",
}: {
  label: string;
  value: string;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${className}`}
    >
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function getPriorityClass(priority: TaskPriority) {
  if (priority === "high") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }
  if (priority === "medium") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }
  return "border-sky-400/20 bg-sky-400/10 text-sky-300";
}

function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dueDate}T12:00:00`));
}
