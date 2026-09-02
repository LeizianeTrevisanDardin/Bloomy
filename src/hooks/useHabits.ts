"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

import type {
  CreateHabitInput,
  Habit,
  HabitCompletionResult,
  HabitUncompletionResult,
} from "@/types/habits";

type HabitDatabaseRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: string | null;
  target_per_week: number | null;
  xp_reward: number | null;
  coin_reward: number | null;
  position: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;

  habit_completions:
    | {
        id: string;
        completed_on: string;
      }[]
    | null;
};

export function useHabits() {
  const [supabase] = useState(
    () => createClient(),
  );

  const [habits, setHabits] =
    useState<Habit[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    creatingHabit,
    setCreatingHabit,
  ] = useState(false);

  const [
    completingHabitId,
    setCompletingHabitId,
  ] = useState<string | null>(
    null,
  );

  const [
    uncompletingHabitId,
    setUncompletingHabitId,
  ] = useState<string | null>(
    null,
  );

  // =================================
  // CALGARY LOCAL DATE
  // =================================

  const getTodayDate =
    useCallback(() => {
      return new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "America/Edmonton",

          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      ).format(new Date());
    }, []);

  // =================================
  // LOAD HABITS
  // =================================

  const loadHabits =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();

        if (
          userError ||
          !userData.user
        ) {
          setHabits([]);

          setError(
            "User session not found.",
          );

          return;
        }

        const today =
          getTodayDate();

        const {
          data,
          error: habitsError,
        } = await supabase
          .from("habits")
          .select(
            `
              id,
              user_id,
              title,
              description,
              icon,
              color,
              frequency,
              target_per_week,
              xp_reward,
              coin_reward,
              position,
              is_active,
              created_at,
              updated_at,
              habit_completions (
                id,
                completed_on
              )
            `,
          )
          .eq(
            "user_id",
            userData.user.id,
          )
          .eq(
            "is_active",
            true,
          )
          .eq(
            "habit_completions.completed_on",
            today,
          )
          .order(
            "position",
            {
              ascending: true,
            },
          )
          .order(
            "created_at",
            {
              ascending: true,
            },
          );

        if (habitsError) {
          throw habitsError;
        }

        const rows =
          (data ??
            []) as HabitDatabaseRow[];

        const formattedHabits:
          Habit[] = rows.map(
          (habit) => ({
            id: habit.id,

            user_id:
              habit.user_id,

            title:
              habit.title,

            description:
              habit.description,

            icon:
              habit.icon ||
              "🌱",

            color:
              habit.color ||
              "purple",

            frequency:
              habit.frequency ||
              "daily",

            target_per_week:
              habit.target_per_week ??
              7,

            xp_reward:
              habit.xp_reward ??
              0,

            coin_reward:
              habit.coin_reward ??
              0,

            position:
              habit.position ??
              0,

            is_active:
              habit.is_active ??
              true,

            created_at:
              habit.created_at,

            updated_at:
              habit.updated_at,

            completed_today:
              Boolean(
                habit
                  .habit_completions
                  ?.length,
              ),
          }),
        );

        setHabits(
          formattedHabits,
        );
      } catch {
        setHabits([]);

        setError(
          "Unable to load habits.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      getTodayDate,
      supabase,
    ]);

  // =================================
  // CREATE HABIT
  // =================================

  const createHabit =
    useCallback(
      async (
        input: CreateHabitInput,
      ): Promise<Habit | null> => {
        try {
          setCreatingHabit(true);
          setError(null);

          const {
            data,
            error: createError,
          } = await supabase.rpc(
            "create_habit",
            {
              p_title:
                input.title,

              p_description:
                input.description ||
                null,

              p_icon:
                input.icon ||
                "🌱",

              p_frequency:
                input.frequency,

              p_target_per_week:
                input.targetPerWeek,

              p_difficulty:
                input.difficulty,
            },
          );

          if (createError) {
            throw createError;
          }

          await loadHabits();

          return data as Habit;
        } catch {
          setError(
            "Unable to create habit.",
          );

          return null;
        } finally {
          setCreatingHabit(
            false,
          );
        }
      },
      [
        loadHabits,
        supabase,
      ],
    );

  // =================================
  // COMPLETE HABIT
  // =================================

  const completeHabit =
    useCallback(
      async (
        habitId: string,
      ): Promise<HabitCompletionResult | null> => {
        try {
          setCompletingHabitId(
            habitId,
          );

          setError(null);

          const {
            data,
            error:
              completionError,
          } = await supabase.rpc(
            "complete_habit",
            {
              p_habit_id:
                habitId,
            },
          );

          if (completionError) {
            throw completionError;
          }

          const result =
            data as HabitCompletionResult;

          setHabits(
            (currentHabits) =>
              currentHabits.map(
                (habit) =>
                  habit.id ===
                  habitId
                    ? {
                        ...habit,

                        completed_today:
                          true,
                      }
                    : habit,
              ),
          );

          return result;
        } catch {
          setError(
            "Unable to complete habit.",
          );

          return null;
        } finally {
          setCompletingHabitId(
            null,
          );
        }
      },
      [supabase],
    );

  // =================================
  // UNCOMPLETE HABIT
  // =================================

  const uncompleteHabit =
    useCallback(
      async (
        habitId: string,
      ): Promise<HabitUncompletionResult | null> => {
        try {
          setUncompletingHabitId(
            habitId,
          );

          setError(null);

          const {
            data,
            error:
              uncompleteError,
          } = await supabase.rpc(
            "uncomplete_habit",
            {
              p_habit_id:
                habitId,
            },
          );

          if (uncompleteError) {
            throw uncompleteError;
          }

          const result =
            data as HabitUncompletionResult;

          setHabits(
            (currentHabits) =>
              currentHabits.map(
                (habit) =>
                  habit.id ===
                  habitId
                    ? {
                        ...habit,

                        completed_today:
                          false,
                      }
                    : habit,
              ),
          );

          return result;
        } catch {
          setError(
            "Unable to undo habit completion.",
          );

          return null;
        } finally {
          setUncompletingHabitId(
            null,
          );
        }
      },
      [supabase],
    );

  // =================================
  // AUTOMATIC INITIAL LOAD
  // =================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHabits();
  }, [loadHabits]);

  // =================================
  // HOOK RESULT
  // =================================

  return {
    habits,
    loading,
    error,
    creatingHabit,
    completingHabitId,
    uncompletingHabitId,
    createHabit,
    completeHabit,
    uncompleteHabit,
    refreshHabits:
      loadHabits,
  };
}