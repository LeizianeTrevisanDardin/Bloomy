"use client";

import { useState } from "react";
import ClockCard from "@/components/ClockCard";
import BloomyWorld from "@/components/BloomyWorld";
import HabitsPanel from "@/components/HabitCard";
import WeatherCard from "@/components/WeatherCard";
import { useLocalWeather } from "@/hooks/useLocalWeather";
import { useProfile } from "@/hooks/useProfiles";
import TasksPanel from "@/components/TasksPanel";
import GoalsPanel from "@/components/GoalsPanel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import { createClient } from "@/lib/supabase/client";
import {
  useStatistics,
} from "@/hooks/useStatistics";

export default function DashboardPage() {
  const router = useRouter();
  const [supabase] = useState(
    () => createClient(),
  );
  const [signingOut, setSigningOut] =
    useState(false);

  const {
    weather,
    automaticScene,
    loading,
    error,
  } = useLocalWeather();

  const {
    profile,
    loading: profileLoading,
    refreshProfile,
  } = useProfile();

  const currentLevel =
    profile?.level ?? 1;

  const currentXP =
    profile?.xp ?? 0;

  const xpGoal =
    currentLevel * 100;

  const xpProgress =
    Math.min(
      100,
      (currentXP / xpGoal) * 100,
    );

  const displayName =
    profileLoading
      ? "Loading..."
      : profile?.display_name ||
        "Bloomy User";

  const {
  statistics,
  loading: statisticsLoading,
  error: statisticsError,
} = useStatistics();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      window.alert(
        "Unable to sign out. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        
        <aside className="hidden w-[220px] shrink-0 border-r border-white/[0.06] bg-[#101014] lg:flex lg:flex-col xl:w-[240px] 2xl:w-[250px]">
          <div className="flex flex-1 flex-col p-5">
            {/* PROFILE */}
            <div className="flex items-center gap-3">
             <div
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-400/20 bg-purple-500/10 bg-cover bg-center text-2xl"
                style={
                  profile?.avatar_url
                    ? {
                        backgroundImage: `url(${profile.avatar_url})`,
                      }
                    : undefined
                }
                role="img"
                aria-label="Profile photo"
              >
                {!profile?.avatar_url && "👩🏻"}
              </div>

              <div>
                <p className="font-semibold text-zinc-100">
                  {displayName}
                </p>

                <p className="mt-1 text-xs text-purple-300">
                  Level {currentLevel}
                </p>
              </div>
            </div>

            {/* XP */}
            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  XP
                </span>

                <span className="text-zinc-300">
                  {currentXP.toLocaleString()} /{" "}
                  {xpGoal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-[width] duration-500"
                    style={{
                      width: `${xpProgress}%`,
                    }}
                  />
                </div>

                <span className="text-lg">
                  ⭐
                </span>
              </div>
            </div>

            {/* NAVIGATION */}
            <nav className="mt-10 space-y-2 text-sm text-zinc-400">
              <SidebarButton
                icon="🏠"
                label="Overview"
                href="/dashboard"
                active
              />

              <SidebarButton
                icon="🌱"
                label="Habits"
                href="/dashboard/habits"
              />

              <SidebarButton
                icon="☑️"
                label="Tasks"
                href="/dashboard/tasks"
              />

              <SidebarButton
                icon="🎯"
                label="Goals"
                href="/dashboard/goals"
              />

              <SidebarButton
                icon="🗓️"
                label="Calendar"
                href="/dashboard/calendar"
              />

              <SidebarButton
                icon="📊"
                label="Statistics"
                href="/dashboard/statistics"
              />

              <SidebarButton
                icon="⚙️"
                label="Settings"
                href="/dashboard/settings"
              />
            </nav>

            {/* LOG OUT */}
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-wait disabled:opacity-50"
              >
                <span className="flex w-6 justify-center text-base">
                  ↪️
                </span>

                <span>
                  {signingOut
                    ? "Signing out..."
                    : "Log out"}
                </span>
              </button>
            </div>

            {/* REMINDER */}
            <div className="mt-auto rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-purple-500/[0.05] p-4">
              <span className="text-2xl">
                🌱
              </span>

              <p className="mt-3 text-sm font-medium text-zinc-200">
                Reminder
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Small actions every day change everything.
              </p>

              <div className="mt-3 text-right text-purple-400">
                ♥
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1800px] px-2 pb-24 pt-2 sm:px-3 sm:pt-3 md:px-4 lg:pb-5 xl:px-5 2xl:px-6">
            <div className="space-y-3">
              {/* BLOOMY WORLD */}
              <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151419]">
                <BloomyWorld automaticScene={automaticScene} />

                {/* CLOCK */}
                <ClockCard />

                {/* REAL WEATHER */}
                <WeatherCard
                  weather={weather}
                  loading={loading}
                  error={error}
                  automaticScene={automaticScene}
                />

                {/* WORLD STATUS */}
                <div className="absolute inset-x-3 bottom-2 z-30 flex items-end justify-between gap-2 md:inset-x-4 md:bottom-3">
                  <div className="flex min-w-0 gap-2">
                    <WorldStat
                      icon="⚡"
                      label="Energy"
                      value={`${profile?.energy ?? 100}/100`}
                      color="bg-amber-400"
                      progress={`${profile?.energy ?? 100}%`}
                    />

                    <WorldStat
                      icon="🪙"
                      label="Coins"
                      value={String(
                        profile?.coins ?? 0,
                      )}
                    />

                    <WorldStat
                      icon="💎"
                      label="Gems"
                      value={String(
                        profile?.gems ?? 0,
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    className="pointer-events-auto hidden h-[46px] shrink-0 items-center rounded-xl border border-white/8 bg-black/70 px-3 text-xs font-medium text-zinc-100 shadow-lg backdrop-blur-lx transition hover:bg-black/85 sm:flex"
                  >
                    🗺️ Explore the world
                  </button>
                </div>
              </section>

              {/* HABITS / TASKS / GOALS */}
              <section className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 2xl:grid-cols-3">
                <div className="h-full min-w-0">
                  <HabitsPanel
                    onRewardsUpdated={
                      refreshProfile
                    }
                  />
                </div>

                <div className="h-full min-w-0">
                  <TasksPanel
                    onRewardsUpdated={
                      refreshProfile
                    }
                  />
                </div>

                <div className="h-full min-w-0 md:col-span-2 2xl:col-span-1">
                  <GoalsPanel
                    onRewardsUpdated={
                      refreshProfile
                    }
                  />
                </div>
              </section>

              {/* CALENDAR / STATISTICS */}
              <section className="grid grid-cols-1 gap-3 2xl:grid-cols-[0.8fr_2fr]">
                <CalendarPanel />

                <StatisticsPanel
                  statistics={statistics}
                  loading={statisticsLoading}
                  error={statisticsError}
                />
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-[100] grid grid-cols-5 border-t border-white/10 bg-[#101014]/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        <MobileNavButton icon="🏠" label="Home" active />
        <MobileNavButton icon="🌱" label="Habits" />
        <MobileNavButton icon="☑️" label="Tasks" />
        <MobileNavButton icon="🎯" label="Goals" />
        <MobileNavButton icon="⚙️" label="Settings" />
      </nav>
    </div>
  );
}

function MobileNavButton({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] transition ${
        active
          ? "bg-purple-500/15 text-purple-200"
          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="max-w-full truncate">{label}</span>
    </button>
  );
}

function SidebarButton({
  icon,
  label,
  href,
  active = false,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-purple-500/15 text-purple-200"
          : "hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <span className="flex w-6 justify-center text-base">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}

function WorldStat({
    icon,
    label,
    value,
    color,
    progress,
  }: {
    icon: string;
    label: string;
    value: string;
    color?: string;
    progress?: string;
  }) {
    return (
      <div className="flex h-[40px] min-w-[80px] items-center gap-2 rounded-xl border border-white/10 bg-black/70 px-3 shadow-lg backdrop-blur-lx md:min-w-[125px]">
        <span className="shrink-0 text-base">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="hidden text-[11px] text-zinc-400 md:inline">
              {label}
            </span>

            <span className="text-xs font-semibold text-white">
              {value}
            </span>
          </div>

          {progress && color && (
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: progress }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }


function CalendarPanel() {
  const { tasks } = useTasks();
  const { goals } = useGoals();

  const [visibleMonth, setVisibleMonth] = useState(
    () => {
      const today = new Date();
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );
    },
  );

  const [selectedDate, setSelectedDate] = useState(
    () => getDateKey(new Date()),
  );

  const weekDays = [
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
  ];

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  // Converts Sunday-first JavaScript days to Monday-first.
  const leadingEmptyDays =
    (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarCells: (number | null)[] = [
    ...Array.from(
      { length: leadingEmptyDays },
      () => null,
    ),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1,
    ),
  ];

  const todayKey = getDateKey(new Date());

  const taskDates = new Set(
    tasks
      .map((task) => task.due_date)
      .filter((date): date is string => Boolean(date)),
  );

  const goalDates = new Set(
    goals
      .map((goal) => goal.deadline)
      .filter((date): date is string => Boolean(date)),
  );

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      new Date(year, month + offset, 1),
    );
  };

  return (
    <div className="min-h-[270px] rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/calendar"
          className="text-lg font-semibold text-zinc-100 transition hover:text-purple-200"
        >
          🗓️ Calendar
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-medium text-zinc-300">
        {new Intl.DateTimeFormat("en-CA", {
          month: "long",
          year: "numeric",
        }).format(visibleMonth)}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {weekDays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-xs text-zinc-500"
          >
            {day}
          </div>
        ))}

        {calendarCells.map((dayNumber, index) => {
          if (dayNumber === null) {
            return (
              <div
                key={`empty-${index}`}
                aria-hidden="true"
              />
            );
          }

          const date = new Date(
            year,
            month,
            dayNumber,
          );
          const dateKey = getDateKey(date);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const hasTask = taskDates.has(dateKey);
          const hasGoal = goalDates.has(dateKey);

          return (
            <div
              key={dateKey}
              className="flex flex-col items-center gap-1"
            >
              <button
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                aria-label={`Select ${dateKey}`}
                className={`flex aspect-square w-full items-center justify-center rounded-lg border text-xs transition ${
                  isSelected
                    ? "border-purple-400/30 bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : isToday
                      ? "border-purple-400/40 bg-purple-500/10 text-purple-200"
                      : "border-transparent text-zinc-300 hover:bg-white/5"
                }`}
              >
                {dayNumber}
              </button>

              <div className="flex h-1 gap-1">
                <span
                  className={`h-1 w-1 rounded-full ${
                    hasTask
                      ? "bg-sky-400"
                      : "bg-transparent"
                  }`}
                />
                <span
                  className={`h-1 w-1 rounded-full ${
                    hasGoal
                      ? "bg-emerald-400"
                      : "bg-transparent"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[10px] text-zinc-500">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Task
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Goal
          </span>
        </div>

        <Link
          href="/dashboard/calendar"
          className="text-purple-300 transition hover:text-purple-200"
        >
          View calendar →
        </Link>
      </div>
    </div>
  );
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function StatisticsPanel({
  statistics,
  loading,
  error,
}: {
  statistics: {
    level: number;
    xp: number;
    currentStreak: number;
    habitWeeklyRate: number;
  };
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="min-h-[270px] min-w-0 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
        <h2 className="text-lg font-semibold text-zinc-100">
          📊 Statistics
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[145px] animate-pulse rounded-xl bg-black/20 p-4"
            >
              <div className="h-7 w-20 rounded bg-white/10" />
              <div className="mt-6 h-3 w-24 rounded bg-white/10" />
              <div className="mt-3 h-3 w-14 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[270px] min-w-0 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
        <h2 className="text-lg font-semibold text-zinc-100">
          📊 Statistics
        </h2>

        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[270px] min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">
          📊 Statistics
        </h2>

        <Link
          href="/dashboard/statistics"
          className="text-xs text-purple-300 transition hover:text-purple-200"
        >
          View all →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          icon="🔥"
          value={statistics.currentStreak.toLocaleString()}
          label="Current streak"
          description="days"
          color="text-orange-400"
        />

        <Stat
          icon="⭐"
          value={statistics.xp.toLocaleString()}
          label="Current XP"
          description="earned"
          color="text-amber-300"
        />

        <Stat
          icon="🏆"
          value={statistics.level.toLocaleString()}
          label="Current level"
          description="keep growing"
          color="text-amber-400"
        />

        <Stat
          icon="🌱"
          value={`${Math.round(
            statistics.habitWeeklyRate,
          )}%`}
          label="Habits completed"
          description="this week"
          color="text-emerald-400"
        />
      </div>
    </div>
  );
}

function Stat({
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
    <div className="rounded-xl bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {icon}
        </span>

        <span className={`text-2xl font-semibold ${color}`}>
          {value}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-zinc-300">
        {label}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}
