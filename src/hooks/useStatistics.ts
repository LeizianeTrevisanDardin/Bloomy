"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

export type UserStatistics = {
  level: number;
  xp: number;
  coins: number;
  gems: number;
  activeHabits: number;
  habitsCompletedToday: number;
  weeklyHabitCompletions: number;
  weeklyHabitTarget: number;
  habitWeeklyRate: number;
  currentStreak: number;
  totalTasks: number;
  completedTasks: number;
  totalGoals: number;
  completedGoals: number;
};

const emptyStatistics: UserStatistics = {
  level: 1,
  xp: 0,
  coins: 0,
  gems: 0,
  activeHabits: 0,
  habitsCompletedToday: 0,
  weeklyHabitCompletions: 0,
  weeklyHabitTarget: 0,
  habitWeeklyRate: 0,
  currentStreak: 0,
  totalTasks: 0,
  completedTasks: 0,
  totalGoals: 0,
  completedGoals: 0,
};

export function useStatistics() {
  const [supabase] = useState(() => createClient());

  const [statistics, setStatistics] =
    useState<UserStatistics>(emptyStatistics);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data,
        error: statisticsError,
      } = await supabase.rpc("get_user_statistics");

      if (statisticsError) {
        throw statisticsError;
      }

      if (!data) {
        setStatistics(emptyStatistics);
        return;
      }

      const result = data as Partial<UserStatistics>;

      setStatistics({
        level: Number(result.level ?? 1),
        xp: Number(result.xp ?? 0),
        coins: Number(result.coins ?? 0),
        gems: Number(result.gems ?? 0),
        activeHabits: Number(result.activeHabits ?? 0),
        habitsCompletedToday: Number(
          result.habitsCompletedToday ?? 0,
        ),
        weeklyHabitCompletions: Number(
          result.weeklyHabitCompletions ?? 0,
        ),
        weeklyHabitTarget: Number(
          result.weeklyHabitTarget ?? 0,
        ),
        habitWeeklyRate: Number(
          result.habitWeeklyRate ?? 0,
        ),
        currentStreak: Number(
          result.currentStreak ?? 0,
        ),
        totalTasks: Number(result.totalTasks ?? 0),
        completedTasks: Number(
          result.completedTasks ?? 0,
        ),
        totalGoals: Number(result.totalGoals ?? 0),
        completedGoals: Number(
          result.completedGoals ?? 0,
        ),
      });
    } catch {
      setStatistics(emptyStatistics);
      setError("Unable to load statistics.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStatistics();
  }, [loadStatistics]);

  return {
    statistics,
    loading,
    error,
    refreshStatistics: loadStatistics,
  };
}
