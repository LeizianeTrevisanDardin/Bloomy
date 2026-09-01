"use client";

import BloomyWorld from "@/components/BloomyWorld";
import HabitsPanel from "@/components/HabitCard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#17151d] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[230px] shrink-0 border-r border-white/10 bg-[#121016] lg:block">
          <div className="sticky top-0 p-5">
            <div className="mb-8">
              <p className="text-lg font-semibold">
                Bloomy
              </p>

              <p className="text-xs text-zinc-500">
                Your cozy productivity world
              </p>
            </div>

            <nav className="space-y-2 text-sm text-zinc-400">
              <button className="w-full rounded-xl bg-purple-500/10 px-3 py-2 text-left text-purple-300">
                Overview
              </button>

              <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5">
                Habits
              </button>

              <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5">
                Tasks
              </button>

              <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5">
                Goals
              </button>

              <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5">
                Calendar
              </button>

              <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5">
                Statistics
              </button>
            </nav>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1500px] p-4 md:p-6 xl:p-8">
            <div className="space-y-4">
              {/* WORLD */}
              <section>
                <BloomyWorld />
              </section>

              {/* HABITS / TASKS / GOALS */}
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <HabitsPanel />

                <TasksPanel />

                <GoalsPanel />
              </section>

              {/* CALENDAR / STATS */}
              <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_2fr]">
                <CalendarPanel />

                <StatisticsPanel />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TasksPanel() {
  return (
    <div className="min-h-[300px] rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold">
        📋 Today&apos;s Tasks
      </h2>

      <div className="mt-4 space-y-3">
        <TaskRow
          title="Study Next.js"
          reward="+50 XP"
          completed
        />

        <TaskRow
          title="Work on CareerFlow"
          reward="+80 XP"
          completed
        />

        <TaskRow
          title="Record YouTube video"
          reward="+60 XP"
        />

        <TaskRow
          title="Read 20 min"
          reward="+30 XP"
        />
      </div>
    </div>
  );
}

function TaskRow({
  title,
  reward,
  completed = false,
}: {
  title: string;
  reward: string;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-black/10 p-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded ${
            completed
              ? "bg-emerald-500 text-black"
              : "border border-white/20"
          }`}
        >
          {completed ? "✓" : ""}
        </div>

        <p
          className={`text-sm ${
            completed
              ? "text-zinc-400 line-through"
              : "text-zinc-200"
          }`}
        >
          {title}
        </p>
      </div>

      <span className="shrink-0 text-xs text-amber-300">
        {reward}
      </span>
    </div>
  );
}

function GoalsPanel() {
  return (
    <div className="min-h-[300px] rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold">
        🎯 Goals
      </h2>

      <div className="mt-5 space-y-5">
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
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-200">
          {title}
        </p>

        <span className="text-xs text-zinc-400">
          {progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-purple-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

function CalendarPanel() {
  return (
    <div className="min-h-[260px] rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold">
        🗓 Calendar
      </h2>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs text-zinc-400">
        {[
          "M",
          "T",
          "W",
          "T",
          "F",
          "S",
          "S",
        ].map((day, index) => (
          <div key={`${day}-${index}`}>
            {day}
          </div>
        ))}

        {Array.from({
          length: 28,
        }).map((_, index) => (
          <div
            key={index}
            className={`flex aspect-square items-center justify-center rounded-lg ${
              index === 8
                ? "bg-purple-500 text-white"
                : "bg-black/10 text-zinc-300"
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatisticsPanel() {
  return (
    <div className="min-h-[260px] rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold">
        📊 Statistics
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon="🔥"
          value="7"
          label="Day streak"
        />

        <Stat
          icon="⭐"
          value="1,240"
          label="Total XP"
        />

        <Stat
          icon="🏆"
          value="23"
          label="Current level"
        />

        <Stat
          icon="🌱"
          value="87%"
          label="Habits this week"
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-black/10 p-4">
      <div className="flex items-center gap-2">
        <span>{icon}</span>

        <span className="text-xl font-semibold">
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        {label}
      </p>
    </div>
  );
}