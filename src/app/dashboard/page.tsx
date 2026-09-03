"use client";


import ClockCard from "@/components/ClockCard";
import BloomyWorld from "@/components/BloomyWorld";
import HabitsPanel from "@/components/HabitCard";
import WeatherCard from "@/components/WeatherCard";
import { useLocalWeather } from "@/hooks/useLocalWeather";
import { useProfile } from "@/hooks/useProfiles";
import TasksPanel from "@/components/TasksPanel";

export default function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        
        <aside className="hidden w-[220px] shrink-0 border-r border-white/[0.06] bg-[#101014] lg:flex lg:flex-col xl:w-[240px] 2xl:w-[250px]">
          <div className="flex flex-1 flex-col p-5">
            {/* PROFILE */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-purple-400/20 bg-purple-500/10 text-2xl">
                👩🏻
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
                active
              />

              <SidebarButton
                icon="🌱"
                label="Habits"
              />

              <SidebarButton
                icon="☑️"
                label="Tasks"
              />

              <SidebarButton
                icon="🎯"
                label="Goals"
              />

              <SidebarButton
                icon="🗓️"
                label="Calendar"
              />

              <SidebarButton
                icon="📊"
                label="Statistics"
              />

              <SidebarButton
                icon="🛍️"
                label="Shop"
              />

              <SidebarButton
                icon="⚙️"
                label="Settings"
              />
            </nav>

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
                  <GoalsPanel />
                </div>
              </section>

              {/* CALENDAR / STATISTICS */}
              <section className="grid grid-cols-1 gap-3 2xl:grid-cols-[0.8fr_2fr]">
                <CalendarPanel />

                <StatisticsPanel />
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
    active = false,
  }: {
    icon: string;
    label: string;
    active?: boolean;
  }) {
    return (
      <button
        type="button"
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
      </button>
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

function GoalsPanel() {
  return (
    <div className="min-h-[300px] rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">
          🎯 Goals
        </h2>

        <span className="text-xs text-zinc-500">
          3 active
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <Goal
          title="Launch CareerFlow"
          progress={75}
        />

        <Goal
          title="Get a job in Tech"
          progress={60}
        />

        <Goal
          title="Save $5,000"
          progress={40}
        />
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-white/[0.04] py-3 text-sm text-purple-300 transition hover:bg-white/[0.08]"
      >
        View all
      </button>
    </div>
  );
}

function Goal({
  title,
  progress,
}: {
  title: string;
  progress: number;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-200">
          {title}
        </p>

        <span className="text-sm font-medium text-zinc-300">
          {progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function CalendarPanel() {
  const days = [
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
  ];

  return (
    <div className="min-h-[270px] rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">
          🗓️ Calendar
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ‹
          </button>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-medium text-zinc-300">
        June 2024
      </p>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {days.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-xs text-zinc-500"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: 28 }).map(
          (_, index) => {
            const dayNumber = index + 1;
            const selected = dayNumber === 9;
            const hasActivity = [
              2,
              9,
              10,
              11,
              12,
              14,
              15,
            ].includes(dayNumber);

            return (
              <div
                key={dayNumber}
                className="flex flex-col items-center gap-1"
              >
                <button
                  type="button"
                  className={`flex aspect-square w-full items-center justify-center rounded-lg text-xs transition ${
                    selected
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {dayNumber}
                </button>

                <span
                  className={`h-1 w-1 rounded-full ${
                    hasActivity
                      ? "bg-emerald-400"
                      : "bg-transparent"
                  }`}
                />
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

function StatisticsPanel() {
  return (
    <div className="min-h-[270px] rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5">
      <h2 className="text-lg font-semibold text-zinc-100">
        📊 Statistics
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon="🔥"
          value="58"
          label="Current streak"
          description="days"
          color="text-orange-400"
        />

        <Stat
          icon="⭐"
          value="1,240"
          label="Total XP"
          description="earned"
          color="text-amber-300"
        />

        <Stat
          icon="🏆"
          value="23"
          label="Current level"
          description="keep growing"
          color="text-amber-400"
        />

        <Stat
          icon="🌱"
          value="87%"
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
