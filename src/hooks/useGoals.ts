"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import type {
  CreateGoalInput,
  Goal,
  GoalCategory,
  GoalDifficulty,
  GoalProgressResult,
  GoalUnit,
} from "@/types/goals";

export type UpdateGoalInput = {
  title: string;
  description: string;
  icon: string;
  category: GoalCategory;
  targetValue: number;
  unit: GoalUnit;
  deadline: string;
  difficulty: GoalDifficulty;
};

const goalRewards = {
  easy: { xp: 100, coins: 20 },
  medium: { xp: 200, coins: 40 },
  hard: { xp: 350, coins: 70 },
} satisfies Record<
  GoalDifficulty,
  { xp: number; coins: number }
>;

export function useGoals() {
  const [supabase] = useState(() => createClient());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingGoal, setCreatingGoal] = useState(false);

  const [
    updatingGoalId,
    setUpdatingGoalId,
  ] = useState<string | null>(null);

  const [
    editingGoalId,
    setEditingGoalId,
  ] = useState<string | null>(null);

  const [
    archivingGoalId,
    setArchivingGoalId,
  ] = useState<string | null>(null);

  const [
    deletingGoalId,
    setDeletingGoalId,
  ] = useState<string | null>(null);

  // =================================
  // LOAD GOALS
  // =================================

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setGoals([]);
        setError("User session not found.");
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
        .eq("user_id", userData.user.id)
        .eq("is_archived", false)
        .order("is_completed", { ascending: true })
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (goalsError) {
        throw goalsError;
      }

      setGoals((data ?? []) as Goal[]);
    } catch {
      setGoals([]);
      setError("Unable to load goals.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // =================================
  // CREATE GOAL
  // =================================

  const createGoal = useCallback(
    async (
      input: CreateGoalInput,
    ): Promise<Goal | null> => {
      try {
        setCreatingGoal(true);
        setError(null);

        const {
          data,
          error: createError,
        } = await supabase.rpc("create_goal", {
          p_title: input.title,
          p_description: input.description || null,
          p_icon: input.icon || "🎯",
          p_category: input.category,
          p_target_value: input.targetValue,
          p_current_value: input.currentValue,
          p_unit: input.unit,
          p_deadline: input.deadline || null,
          p_difficulty: input.difficulty,
        });

        if (createError) {
          throw createError;
        }

        await loadGoals();
        return data as Goal;
      } catch {
        setError("Unable to create goal.");
        return null;
      } finally {
        setCreatingGoal(false);
      }
    },
    [loadGoals, supabase],
  );

  // =================================
  // UPDATE GOAL PROGRESS
  // =================================

  const updateGoalProgress = useCallback(
    async (
      goalId: string,
      currentValue: number,
    ): Promise<GoalProgressResult | null> => {
      try {
        setUpdatingGoalId(goalId);
        setError(null);

        const {
          data,
          error: updateError,
        } = await supabase.rpc("update_goal_progress", {
          p_goal_id: goalId,
          p_current_value: currentValue,
        });

        if (updateError) {
          throw updateError;
        }

        const result = data as GoalProgressResult;

        setGoals((currentGoals) =>
          currentGoals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  current_value: result.currentValue,
                  is_completed: result.completed,
                  reward_claimed:
                    goal.reward_claimed || result.rewardAwarded,
                  completed_at: result.completed
                    ? goal.completed_at || new Date().toISOString()
                    : null,
                }
              : goal,
          ),
        );

        return result;
      } catch {
        setError("Unable to update goal progress.");
        return null;
      } finally {
        setUpdatingGoalId(null);
      }
    },
    [supabase],
  );

  // =================================
  // EDIT GOAL DETAILS
  // =================================

  const updateGoal = useCallback(
    async (
      goalId: string,
      input: UpdateGoalInput,
    ): Promise<boolean> => {
      try {
        setEditingGoalId(goalId);
        setError(null);

        const {
          data,
          error: updateError,
        } = await supabase.rpc("update_goal", {
          p_goal_id: goalId,
          p_title: input.title.trim(),
          p_description: input.description.trim(),
          p_icon: input.icon || "🎯",
          p_category: input.category,
          p_target_value: input.targetValue,
          p_unit: input.unit,
          p_deadline: input.deadline || null,
          p_difficulty: input.difficulty,
        });

        if (updateError) {
          throw updateError;
        }

        if (!data) {
          throw new Error("Goal was not updated.");
        }

        setGoals((currentGoals) =>
          currentGoals.map((goal) => {
            if (goal.id !== goalId) return goal;

            const reward = goalRewards[input.difficulty];

            return {
              ...goal,
              title: input.title.trim(),
              description:
                input.description.trim() || null,
              icon: input.icon || "🎯",
              category: input.category,
              target_value: input.targetValue,
              unit: input.unit,
              deadline: input.deadline || null,
              difficulty: input.difficulty,
              xp_reward: goal.reward_claimed
                ? goal.xp_reward
                : reward.xp,
              coin_reward: goal.reward_claimed
                ? goal.coin_reward
                : reward.coins,
            };
          }),
        );

        return true;
      } catch {
        setError(
          "Unable to update goal. Check that the target is not below its current progress.",
        );
        return false;
      } finally {
        setEditingGoalId(null);
      }
    },
    [supabase],
  );

  // =================================
  // ARCHIVE GOAL
  // =================================

  const archiveGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      try {
        setArchivingGoalId(goalId);
        setError(null);

        const {
          data,
          error: archiveError,
        } = await supabase.rpc("archive_goal", {
          p_goal_id: goalId,
        });

        if (archiveError) {
          throw archiveError;
        }

        if (!data) {
          throw new Error("Goal was not archived.");
        }

        setGoals((currentGoals) =>
          currentGoals.filter((goal) => goal.id !== goalId),
        );

        return true;
      } catch {
        setError("Unable to archive goal.");
        return false;
      } finally {
        setArchivingGoalId(null);
      }
    },
    [supabase],
  );

  // =================================
  // DELETE GOAL
  // =================================

  const deleteGoal = useCallback(
    async (goalId: string): Promise<boolean> => {
      try {
        setDeletingGoalId(goalId);
        setError(null);

        const {
          data,
          error: deleteError,
        } = await supabase.rpc("delete_goal", {
          p_goal_id: goalId,
        });

        if (deleteError) {
          throw deleteError;
        }

        if (!data) {
          throw new Error("Goal was not deleted.");
        }

        setGoals((currentGoals) =>
          currentGoals.filter((goal) => goal.id !== goalId),
        );

        return true;
      } catch {
        setError("Unable to delete goal.");
        return false;
      } finally {
        setDeletingGoalId(null);
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
    editingGoalId,
    archivingGoalId,
    deletingGoalId,
    createGoal,
    updateGoalProgress,
    updateGoal,
    archiveGoal,
    deleteGoal,
    refreshGoals: loadGoals,
  };
}
