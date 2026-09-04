"use client";

import Link from "next/link";

import { useStatistics } from "@/hooks/useStatistics";

export default function StatisticsPage() {
  const {
    statistics,
    loading,
    error,
    refreshStatistics,
  } = useStatistics();

  const xpGoal = statistics.level * 100;
  const xpProgress = getPercentage(statistics.xp, xpGoal);
  const habitTodayRate = getPercentage(
    statistics.habitsCompletedToday,
    statistics.activeHabits,
  );
  const taskRate = getPercentage(
    statistics.completedTasks,
    statistics.totalTasks,
  );
  const goalRate = getPercentage(
    statistics.completedGoals,
    statistics.totalGoals,
  );

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
              Your growth
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              📊 Statistics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Follow your consistency, rewards and completion
              progress across Bloomy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshStatistics()}
            disabled={loading}
            className="h-11 rounded-xl border border-purple-400/20 bg-purple-500/10 px-5 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh statistics"}
          </button>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <StatisticsSkeleton />
        ) : (
          <>
            <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                icon="🔥"
                value={String(statistics.currentStreak)}
                label="Current streak"
                description={
                  statistics.currentStreak === 1
                    ? "consecutive day"
                    : "consecutive days"
                }
                color="text-orange-300"
              />
              <MetricCard
                icon="🏆"
                value={String(statistics.level)}
                label="Current level"
                description="keep growing"
                color="text-amber-300"
              />
              <MetricCard
                icon="🪙"
                value={statistics.coins.toLocaleString()}
                label="Coins"
                description="available balance"
                color="text-yellow-300"
              />
              <MetricCard
                icon="💎"
                value={statistics.gems.toLocaleString()}
                label="Gems"
                description="available balance"
                color="text-sky-300"
              />
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/[0.08] to-white/[0.025] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
                    Level progress
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Level {statistics.level}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xl font-semibold text-amber-300">
                    {statistics.xp.toLocaleString()} XP
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {xpGoal.toLocaleString()} XP needed for the
                    next level
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>{Math.round(xpProgress)}% complete</span>
                  <span>
                    {statistics.xp.toLocaleString()} /{" "}
                    {xpGoal.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  percentage={xpProgress}
                  color="from-purple-600 to-purple-400"
                />
              </div>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <ProgressCard
                icon="🌱"
                title="Habits"
                subtitle="Weekly consistency"
                completed={statistics.weeklyHabitCompletions}
                total={statistics.weeklyHabitTarget}
                percentage={statistics.habitWeeklyRate}
                color="from-emerald-600 to-emerald-400"
                accent="text-emerald-300"
                href="/dashboard/habits"
              />
              <ProgressCard
                icon="☑️"
                title="Tasks"
                subtitle="Overall completion"
                completed={statistics.completedTasks}
                total={statistics.totalTasks}
                percentage={taskRate}
                color="from-sky-600 to-sky-400"
                accent="text-sky-300"
                href="/dashboard/tasks"
              />
              <ProgressCard
                icon="🎯"
                title="Goals"
                subtitle="Overall completion"
                completed={statistics.completedGoals}
                total={statistics.totalGoals}
                percentage={goalRate}
                color="from-fuchsia-600 to-purple-400"
                accent="text-fuchsia-300"
                href="/dashboard/goals"
              />
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                      Today
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Habit progress
                    </h2>
                  </div>
                  <span className="text-2xl">🌿</span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-semibold text-emerald-300">
                      {statistics.habitsCompletedToday}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      of {statistics.activeHabits} active habits
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-zinc-300">
                    {Math.round(habitTodayRate)}%
                  </p>
                </div>

                <div className="mt-5">
                  <ProgressBar
                    percentage={habitTodayRate}
                    color="from-emerald-600 to-emerald-400"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
                  Snapshot
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Your Bloomy world
                </h2>

                <div className="mt-5 space-y-3">
                  <SnapshotRow
                    icon="🌱"
                    label="Active habits"
                    value={statistics.activeHabits}
                  />
                  <SnapshotRow
                    icon="📋"
                    label="Total tasks"
                    value={statistics.totalTasks}
                  />
                  <SnapshotRow
                    icon="🎯"
                    label="Total goals"
                    value={statistics.totalGoals}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  value,
  label,
  description,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl">
          {icon}
        </span>
        <p className={`truncate text-2xl font-semibold ${color}`}>
          {value}
        </p>
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-200">
        {label}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </article>
  );
}

function ProgressCard({
  icon,
  title,
  subtitle,
  completed,
  total,
  percentage,
  color,
  accent,
  href,
}: {
  icon: string;
  title: string;
  subtitle: string;
  completed: number;
  total: number;
  percentage: number;
  color: string;
  accent: string;
  href: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {icon} {title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <span className={`text-lg font-semibold ${accent}`}>
          {Math.round(percentage)}%
        </span>
      </div>

      <p className="mt-6 text-sm text-zinc-400">
        <span className="font-semibold text-zinc-100">{completed}</span>{" "}
        of <span className="font-semibold text-zinc-100">{total}</span>{" "}
        completed
      </p>

      <div className="mt-3">
        <ProgressBar percentage={percentage} color={color} />
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex text-xs font-medium text-purple-300 transition hover:text-purple-200"
      >
        Manage {title.toLowerCase()} →
      </Link>
    </article>
  );
}

function ProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}

function SnapshotRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
      <span className="text-sm text-zinc-400">
        {icon} {label}
      </span>
      <span className="font-semibold text-zinc-200">{value}</span>
    </div>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="mt-7 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-2xl bg-white/5"
          />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-3xl bg-white/5" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-52 animate-pulse rounded-3xl bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

function getPercentage(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (completed / total) * 100));
}
