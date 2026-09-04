"use client";

import Link from "next/link";
import { useState } from "react";

import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import type { Goal } from "@/types/goals";
import type { Task } from "@/types/tasks";

const weekDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export default function CalendarPage() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { goals, loading: goalsLoading } = useGoals();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(
    () => getDateKey(new Date()),
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const todayKey = getDateKey(new Date());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
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

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const tasksByDate = groupTasksByDate(tasks);
  const goalsByDate = groupGoalsByDate(goals);

  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const selectedGoals = goalsByDate.get(selectedDate) ?? [];
  const loading = tasksLoading || goalsLoading;

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(year, month + offset, 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(getDateKey(nextMonth));
  };

  const goToToday = () => {
    const today = new Date();
    setVisibleMonth(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
    setSelectedDate(getDateKey(today));
  };

  return (
    <main className="min-h-screen bg-[#0c0c0f] px-3 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              ← Back to dashboard
            </Link>

            <p className="mt-7 text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
              Plan your time
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              🗓️ Calendar
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              See task due dates and goal deadlines together in
              one place.
            </p>
          </div>

          <button
            type="button"
            onClick={goToToday}
            className="h-11 rounded-xl border border-purple-400/20 bg-purple-500/10 px-5 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"
          >
            Today
          </button>
        </header>

        <div className="mt-7 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Monthly view
                </p>
                <h2 className="mt-1 text-xl font-semibold capitalize sm:text-2xl">
                  {formatMonth(visibleMonth)}
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-zinc-300 transition hover:bg-white/10 hover:text-white sm:flex-none"
                >
                  ‹ <span className="ml-2 text-xs">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="flex h-10 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-zinc-300 transition hover:bg-white/10 hover:text-white sm:flex-none"
                >
                  <span className="mr-2 text-xs">Next</span> ›
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[700px] p-3 sm:p-5">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-zinc-500"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarCells.map((dayNumber, index) => {
                    if (dayNumber === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[108px] rounded-2xl bg-black/10"
                          aria-hidden="true"
                        />
                      );
                    }

                    const dateKey = getDateKey(
                      new Date(year, month, dayNumber),
                    );
                    const dayTasks = tasksByDate.get(dateKey) ?? [];
                    const dayGoals = goalsByDate.get(dateKey) ?? [];
                    const isToday = dateKey === todayKey;
                    const isSelected = dateKey === selectedDate;

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedDate(dateKey)}
                        className={`min-h-[108px] rounded-2xl border p-2.5 text-left transition ${
                          isSelected
                            ? "border-purple-400/40 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                            : "border-white/[0.07] bg-black/20 hover:border-white/15 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium ${
                              isToday
                                ? "bg-purple-500 text-white"
                                : "text-zinc-300"
                            }`}
                          >
                            {dayNumber}
                          </span>

                          {(dayTasks.length > 0 ||
                            dayGoals.length > 0) && (
                            <span className="text-[10px] text-zinc-500">
                              {dayTasks.length + dayGoals.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-1">
                          {dayTasks.slice(0, 2).map((task) => (
                            <CalendarBadge
                              key={task.id}
                              label={task.title}
                              color="sky"
                              completed={task.is_completed}
                            />
                          ))}
                          {dayGoals.slice(0, 2).map((goal) => (
                            <CalendarBadge
                              key={goal.id}
                              label={goal.title}
                              color="emerald"
                              completed={goal.is_completed}
                            />
                          ))}

                          {dayTasks.length + dayGoals.length > 4 && (
                            <span className="block pl-1 text-[9px] text-zinc-500">
                              +{dayTasks.length + dayGoals.length - 4} more
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.07] px-5 py-4 text-xs text-zinc-500">
              <LegendDot color="bg-sky-400" label="Task due date" />
              <LegendDot color="bg-emerald-400" label="Goal deadline" />
              <LegendDot color="bg-purple-500" label="Today" />
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 xl:sticky xl:top-5 xl:h-fit">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300">
              Selected day
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {formatSelectedDate(selectedDate)}
            </h2>

            {loading ? (
              <div className="mt-5 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            ) : selectedTasks.length === 0 &&
              selectedGoals.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
                <div className="text-3xl">🌿</div>
                <p className="mt-3 text-sm font-medium text-zinc-300">
                  Nothing scheduled
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  This day is free from task due dates and goal
                  deadlines.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {selectedTasks.length > 0 && (
                  <AgendaGroup
                    title="Tasks"
                    icon="☑️"
                    items={selectedTasks.map((task) => ({
                      id: task.id,
                      title: task.title,
                      description:
                        task.description ||
                        `${capitalize(task.priority)} priority`,
                      completed: task.is_completed,
                      color: "sky" as const,
                    }))}
                  />
                )}

                {selectedGoals.length > 0 && (
                  <AgendaGroup
                    title="Goals"
                    icon="🎯"
                    items={selectedGoals.map((goal) => ({
                      id: goal.id,
                      title: goal.title,
                      description: `${formatValue(
                        goal.current_value,
                        goal.unit,
                      )} of ${formatValue(
                        goal.target_value,
                        goal.unit,
                      )}`,
                      completed: goal.is_completed,
                      color: "emerald" as const,
                    }))}
                  />
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/tasks"
                className="rounded-xl border border-sky-400/15 bg-sky-500/5 px-3 py-2.5 text-center text-xs text-sky-200 transition hover:bg-sky-500/10"
              >
                Manage tasks
              </Link>
              <Link
                href="/dashboard/goals"
                className="rounded-xl border border-emerald-400/15 bg-emerald-500/5 px-3 py-2.5 text-center text-xs text-emerald-200 transition hover:bg-emerald-500/10"
              >
                Manage goals
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type AgendaItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  color: "sky" | "emerald";
};

function AgendaGroup({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: AgendaItem[];
}) {
  return (
    <section>
      <h3 className="text-sm font-medium text-zinc-300">
        {icon} {title}
      </h3>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-3 ${
              item.color === "sky"
                ? "border-sky-400/10 bg-sky-500/5"
                : "border-emerald-400/10 bg-emerald-500/5"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  item.color === "sky"
                    ? "bg-sky-400"
                    : "bg-emerald-400"
                }`}
              />
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-medium ${
                    item.completed
                      ? "text-zinc-500 line-through"
                      : "text-zinc-200"
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CalendarBadge({
  label,
  color,
  completed,
}: {
  label: string;
  color: "sky" | "emerald";
  completed: boolean;
}) {
  return (
    <span
      className={`block truncate rounded-md px-1.5 py-1 text-[9px] ${
        color === "sky"
          ? "bg-sky-500/10 text-sky-300"
          : "bg-emerald-500/10 text-emerald-300"
      } ${completed ? "line-through opacity-50" : ""}`}
    >
      {label}
    </span>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function groupTasksByDate(tasks: Task[]) {
  const result = new Map<string, Task[]>();

  tasks.forEach((task) => {
    if (!task.due_date) return;
    const existing = result.get(task.due_date) ?? [];
    result.set(task.due_date, [...existing, task]);
  });

  return result;
}

function groupGoalsByDate(goals: Goal[]) {
  const result = new Map<string, Goal[]>();

  goals.forEach((goal) => {
    if (!goal.deadline) return;
    const existing = result.get(goal.deadline) ?? [];
    result.set(goal.deadline, [...existing, goal]);
  });

  return result;
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSelectedDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatValue(value: number, unit: string) {
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
