"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";

type Habit = {
  id: number;
  title: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  streak: number;
};

const initialHabits: Habit[] = [
  {
    id: 1,
    title: "Drink Water",
    icon: "💧",
    xpReward: 20,
    coinReward: 5,
    streak: 4,
  },
  {
    id: 2,
    title: "Workout",
    icon: "🏋️",
    xpReward: 40,
    coinReward: 15,
    streak: 3,
  },
  {
    id: 3,
    title: "Study 30 minutes",
    icon: "📚",
    xpReward: 30,
    coinReward: 10,
    streak: 6,
  },
];

export default function HabitsPanel() {
  const { addXp, addCoins } = useGame();

  const [completedHabits, setCompletedHabits] = useState<number[]>([]);

  const handleComplete = (habit: Habit) => {
    const alreadyCompleted = completedHabits.includes(habit.id);

    if (alreadyCompleted) return;

    addXp(habit.xpReward);
    addCoins(habit.coinReward);

    setCompletedHabits((current) => [
      ...current,
      habit.id,
    ]);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
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
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
        >
          + Add habit
        </button>
      </div>

      <div className="space-y-3">
        {initialHabits.map((habit) => {
          const completed = completedHabits.includes(habit.id);

          return (
            <div
              key={habit.id}
              className={`group rounded-2xl border p-4 transition ${
                completed
                  ? "border-emerald-400/20 bg-emerald-400/5"
                  : "border-white/10 bg-black/10 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">
                    {habit.icon}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate font-medium ${
                        completed
                          ? "text-zinc-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {habit.title}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span>🔥 {habit.streak} day streak</span>

                      <span>•</span>

                      <span>+{habit.xpReward} XP</span>

                      <span>•</span>

                      <span>+{habit.coinReward} coins</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleComplete(habit)}
                  disabled={completed}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg transition ${
                    completed
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-white/15 bg-white/5 text-zinc-300 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                  }`}
                  aria-label={
                    completed
                      ? `${habit.title} completed`
                      : `Complete ${habit.title}`
                  }
                >
                  {completed ? "✓" : ""}
                </button>
              </div>

              <div className="mt-4 flex gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((day, index) => {
                  const active =
                    index < Math.min(habit.streak, 7);

                  return (
                    <div
                      key={day}
                      className={`h-2 flex-1 rounded-full ${
                        active
                          ? "bg-purple-400"
                          : "bg-white/10"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}