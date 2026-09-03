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
  CreateGoalInput,
  Goal,
  GoalProgressResult,
} from "@/types/goals";

export function useGoals() {
  const [supabase] = useState(
    () => createClient(),
  );

  const [goals, setGoals] =
    useState<Goal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    creatingGoal,
    setCreatingGoal,
  ] = useState(false);

  const [
    updatingGoalId,
    setUpdatingGoalId,
  ] = useState<string | null>(
    null,
  );

  // =================================
  // LOAD GOALS
  // =================================

  const loadGoals =
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
          setGoals([]);

          setError(
            "User session not found.",
          );

          return;
        }

        const {
          data,
          error: goalsError,
        } = await supabase
          .from("goals")
          .select(
            `
              id,
              user_id,
              title,
              description,
              icon,
              category,
              target_value,
              current_value,
              unit,
              deadline,
              difficulty,
              xp_reward,
              coin_reward,
              position,
              is_completed,
              reward_claimed,
              completed_at,
              is_archived,
              created_at,
              updated_at
            `,
          )
          .eq(
            "user_id",
            userData.user.id,
          )
          .eq(
            "is_archived",
            false,
          )
          .order(
            "is_completed",
            {
              ascending: true,
            },
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
              ascending: false,
            },
          );

        if (goalsError) {
          throw goalsError;
        }

        setGoals(
          (data ?? []) as Goal[],
        );
      } catch {
        setGoals([]);

        setError(
          "Unable to load goals.",
        );
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  // =================================
  // CREATE GOAL
  // =================================

  const createGoal =
    useCallback(
      async (
        input: CreateGoalInput,
      ): Promise<Goal | null> => {
        try {
          setCreatingGoal(true);
          setError(null);

          const {
            data,
            error: createError,
          } = await supabase.rpc(
            "create_goal",
            {
              p_title:
                input.title,

              p_description:
                input.description ||
                null,

              p_icon:
                input.icon ||
                "🎯",

              p_category:
                input.category,

              p_target_value:
                input.targetValue,

              p_current_value:
                input.currentValue,

              p_unit:
                input.unit,

              p_deadline:
                input.deadline ||
                null,

              p_difficulty:
                input.difficulty,
            },
          );

          if (createError) {
            throw createError;
          }

          await loadGoals();

          return data as Goal;
        } catch {
          setError(
            "Unable to create goal.",
          );

          return null;
        } finally {
          setCreatingGoal(
            false,
          );
        }
      },
      [
        loadGoals,
        supabase,
      ],
    );

  // =================================
  // UPDATE GOAL PROGRESS
  // =================================

  const updateGoalProgress =
    useCallback(
      async (
        goalId: string,
        currentValue: number,
      ): Promise<GoalProgressResult | null> => {
        try {
          setUpdatingGoalId(
            goalId,
          );

          setError(null);

          const {
            data,
            error: updateError,
          } = await supabase.rpc(
            "update_goal_progress",
            {
              p_goal_id:
                goalId,

              p_current_value:
                currentValue,
            },
          );

          if (updateError) {
            throw updateError;
          }

          const result =
            data as GoalProgressResult;

          setGoals(
            (currentGoals) =>
              currentGoals.map(
                (goal) =>
                  goal.id ===
                  goalId
                    ? {
                        ...goal,

                        current_value:
                          result.currentValue,

                        is_completed:
                          result.completed,

                        reward_claimed:
                          goal.reward_claimed ||
                          result.rewardAwarded,

                        completed_at:
                          result.completed
                            ? goal.completed_at ||
                              new Date()
                                .toISOString()
                            : null,
                      }
                    : goal,
              ),
          );

          return result;
        } catch {
          setError(
            "Unable to update goal progress.",
          );

          return null;
        } finally {
          setUpdatingGoalId(
            null,
          );
        }
      },
      [supabase],
    );

  // =================================
  // INITIAL LOAD
  // =================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    creatingGoal,
    updatingGoalId,
    createGoal,
    updateGoalProgress,
    refreshGoals:
      loadGoals,
  };
}