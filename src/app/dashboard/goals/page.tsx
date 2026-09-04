"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  useGoals,
  type UpdateGoalInput,
} from "@/hooks/useGoals";
import type {
  Goal,
  GoalCategory,
  GoalDifficulty,
  GoalUnit,
} from "@/types/goals";

type ConfirmationAction = {
  type: "archive" | "delete";
  goal: Goal;
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

const goalRewards: Record<GoalDifficulty, string> = {
  easy: "100 XP · 20 coins",
  medium: "200 XP · 40 coins",
  hard: "350 XP · 70 coins",
};

export default function GoalsPage() {
  const {
    goals,
    loading,
    error,
    editingGoalId,
    archivingGoalId,
    deletingGoalId,
    updateGoal,
    archiveGoal,
    deleteGoal,
  } = useGoals();

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);
  const [form, setForm] =
    useState<UpdateGoalInput | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<ConfirmationAction | null>(null);

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description ?? "",
      icon: goal.icon,
      category: goal.category,
      targetValue: goal.target_value,
      unit: goal.unit,
      deadline: goal.deadline ?? "",
      difficulty: goal.difficulty,
    });
    setFormError(null);
  };

  const closeEditModal = () => {
    if (editingGoalId) return;

    setEditingGoal(null);
    setForm(null);
    setFormError(null);
  };

  const handleUpdate = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingGoal || !form) return;

    const title = form.title.trim();

    if (title.length < 2) {
      setFormError(
        "Enter a goal name with at least 2 characters.",
      );
      return;
    }

    if (form.targetValue <= 0) {
      setFormError("Target value must be greater than zero.");
      return;
    }

    if (form.targetValue < editingGoal.current_value) {
      setFormError(
        `Target cannot be lower than the current progress (${formatValue(
          editingGoal.current_value,
          editingGoal.unit,
        )}).`,
      );
      return;
    }

    setFormError(null);

    const updated = await updateGoal(editingGoal.id, {
      ...form,
      title,
      description: form.description.trim(),
    });

    if (!updated) {
      setFormError(
        "Unable to update the goal. Please check the values and try again.",
      );
      return;
    }

    closeEditModal();
  };

  const handleConfirmAction = async () => {
    if (!confirmation) return;

    const { type, goal } = confirmation;
    const succeeded =
      type === "archive"
        ? await archiveGoal(goal.id)
        : await deleteGoal(goal.id);

    if (succeeded) setConfirmation(null);
  };

  const completedCount = goals.filter(
    (goal) => goal.is_completed,
  ).length;
  const activeCount = goals.length - completedCount;
  const overdueCount = goals.filter((goal) => {
    if (!goal.deadline || goal.is_completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${goal.deadline}T00:00:00`) < today;
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
              Long-term progress
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              🎯 Manage Goals
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Update your goal details, review progress, archive
              goals for later, or permanently remove them.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 px-4 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"
          >
            + Add goal on dashboard
          </Link>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Active goals"
            value={String(activeCount)}
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
              <h2 className="text-xl font-semibold">Your goals</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Manage all non-archived goals.
              </p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
              {goals.length} total
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl bg-white/5"
                />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
              <div className="text-4xl">🎯</div>
              <h3 className="mt-4 font-medium">No goals yet</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Create a goal from your dashboard to begin.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {goals.map((goal) => {
                const progress = getProgress(goal);
                const isBusy =
                  editingGoalId === goal.id ||
                  archivingGoalId === goal.id ||
                  deletingGoalId === goal.id;

                return (
                  <article
                    key={goal.id}
                    className={`rounded-2xl border p-4 transition sm:p-5 ${
                      goal.is_completed
                        ? "border-emerald-400/15 bg-emerald-500/[0.04]"
                        : "border-white/10 bg-black/20 hover:border-white/15 hover:bg-white/[0.035]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                        {goal.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-zinc-100">
                            {goal.title}
                          </h3>
                          {goal.is_completed && (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="mt-1 min-h-5 text-sm text-zinc-500">
                          {goal.description || "No description added."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                          <span className="rounded-lg bg-white/5 px-2 py-1 capitalize">
                            {goal.category}
                          </span>
                          <span className="rounded-lg bg-white/5 px-2 py-1 capitalize">
                            {goal.difficulty}
                          </span>
                          {goal.deadline && (
                            <span className="rounded-lg bg-white/5 px-2 py-1">
                              📅 {formatDeadline(goal.deadline)}
                            </span>
                          )}
                          <span className="rounded-lg bg-white/5 px-2 py-1">
                            +{goal.xp_reward} XP
                          </span>
                          <span className="rounded-lg bg-white/5 px-2 py-1">
                            +{goal.coin_reward} coins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          {formatValue(goal.current_value, goal.unit)} of{" "}
                          {formatValue(goal.target_value, goal.unit)}
                        </span>
                        <span className="font-medium text-purple-300">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-[width] ${
                            goal.is_completed
                              ? "bg-emerald-400"
                              : "bg-gradient-to-r from-purple-600 to-purple-400"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(goal)}
                        disabled={isBusy}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmation({ type: "archive", goal })
                        }
                        disabled={isBusy}
                        className="rounded-xl border border-amber-400/15 bg-amber-500/5 px-3 py-2 text-xs text-amber-200 transition hover:bg-amber-500/10 disabled:opacity-50"
                      >
                        {archivingGoalId === goal.id
                          ? "Archiving..."
                          : "📦 Archive"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmation({ type: "delete", goal })
                        }
                        disabled={isBusy}
                        className="rounded-xl border border-red-400/15 bg-red-500/5 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingGoalId === goal.id
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

      {editingGoal && form && (
        <EditGoalModal
          goal={editingGoal}
          form={form}
          formError={formError}
          loading={editingGoalId === editingGoal.id}
          setForm={setForm}
          onClose={closeEditModal}
          onSubmit={(event) => void handleUpdate(event)}
        />
      )}

      {confirmation && (
        <ConfirmationModal
          action={confirmation}
          loading={
            archivingGoalId === confirmation.goal.id ||
            deletingGoalId === confirmation.goal.id
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={() => void handleConfirmAction()}
        />
      )}
    </main>
  );
}

function EditGoalModal({
  goal,
  form,
  formError,
  loading,
  setForm,
  onClose,
  onSubmit,
}: {
  goal: Goal;
  form: UpdateGoalInput;
  formError: string | null;
  loading: boolean;
  setForm: (form: UpdateGoalInput) => void;
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
      <div className="relative z-10 my-auto w-full max-w-xl rounded-3xl border border-white/10 bg-[#18181d] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Update your plan
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Edit goal</h2>
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
            <span className="text-sm text-zinc-300">Goal name</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              maxLength={100}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              rows={3}
              maxLength={300}
              className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
            />
          </label>

          <div>
            <span className="text-sm text-zinc-300">Icon</span>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`flex aspect-square items-center justify-center rounded-xl border text-xl transition ${
                    form.icon === icon
                      ? "border-purple-400/40 bg-purple-500/15"
                      : "border-white/10 bg-black/20 hover:bg-white/5"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Category"
              value={form.category}
              onChange={(value) =>
                setForm({ ...form, category: value as GoalCategory })
              }
              options={[
                ["personal", "Personal"],
                ["career", "Career"],
                ["health", "Health"],
                ["finance", "Finance"],
                ["education", "Education"],
                ["other", "Other"],
              ]}
            />
            <SelectField
              label="Unit"
              value={form.unit}
              onChange={(value) =>
                setForm({ ...form, unit: value as GoalUnit })
              }
              options={[
                ["percent", "Percent"],
                ["dollars", "Dollars"],
                ["hours", "Hours"],
                ["days", "Days"],
                ["items", "Items"],
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-zinc-300">Target value</span>
              <input
                type="number"
                min={goal.current_value || 0.01}
                step="any"
                value={form.targetValue}
                onChange={(event) =>
                  setForm({
                    ...form,
                    targetValue: Number(event.target.value),
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-purple-400/40"
              />
              <span className="mt-1 block text-[11px] text-zinc-500">
                Current progress: {formatValue(goal.current_value, goal.unit)}
              </span>
            </label>

            <label className="block">
              <span className="text-sm text-zinc-300">Deadline</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  setForm({ ...form, deadline: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm outline-none focus:border-purple-400/40"
              />
            </label>
          </div>

          <SelectField
            label="Difficulty"
            value={form.difficulty}
            onChange={(value) =>
              setForm({ ...form, difficulty: value as GoalDifficulty })
            }
            options={[
              ["easy", `Easy — ${goalRewards.easy}`],
              ["medium", `Medium — ${goalRewards.medium}`],
              ["hard", `Hard — ${goalRewards.hard}`],
            ]}
          />

          {goal.reward_claimed && (
            <p className="rounded-xl border border-amber-400/15 bg-amber-500/5 p-3 text-xs text-amber-200">
              This goal already awarded its reward. Changing the
              difficulty will not change the reward already received.
            </p>
          )}

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
              className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-400 disabled:opacity-50"
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
        <div className={`h-1 ${isDelete ? "bg-red-500" : "bg-amber-400"}`} />
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
            {isDelete ? "Delete goal?" : "Archive goal?"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            <span className="font-medium text-zinc-200">
              “{action.goal.title}”
            </span>{" "}
            {isDelete
              ? "will be permanently removed. Earned rewards will not be removed, but this action cannot be undone."
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
                  : "Archive goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#111115] px-4 py-3 text-sm outline-none focus:border-purple-400/40"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
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
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 ${className}`}>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function getProgress(goal: Goal) {
  if (goal.target_value <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, (goal.current_value / goal.target_value) * 100),
  );
}

function formatValue(value: number, unit: GoalUnit) {
  if (unit === "percent") return `${Math.round(value)}%`;
  if (unit === "dollars") {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return `${value} ${unit}`;
}

function formatDeadline(deadline: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${deadline}T12:00:00`));
}
