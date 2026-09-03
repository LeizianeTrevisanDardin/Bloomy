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
  CreateTaskInput,
  Task,
  TaskCompletionResult,
  TaskUncompletionResult,
} from "@/types/tasks";

export function useTasks() {
  const [supabase] = useState(
    () => createClient(),
  );

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    creatingTask,
    setCreatingTask,
  ] = useState(false);

  const [
    completingTaskId,
    setCompletingTaskId,
  ] = useState<string | null>(
    null,
  );

  const [
    uncompletingTaskId,
    setUncompletingTaskId,
  ] = useState<string | null>(
    null,
  );

  // =================================
  // LOAD TASKS
  // =================================

  const loadTasks =
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
          setTasks([]);

          setError(
            "User session not found.",
          );

          return;
        }

        const {
          data,
          error: tasksError,
        } = await supabase
          .from("tasks")
          .select(
            `
              id,
              user_id,
              title,
              description,
              due_date,
              priority,
              difficulty,
              xp_reward,
              coin_reward,
              position,
              is_completed,
              completed_at,
              created_at,
              updated_at
            `,
          )
          .eq(
            "user_id",
            userData.user.id,
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

        if (tasksError) {
          throw tasksError;
        }

        setTasks(
          (data ?? []) as Task[],
        );
      } catch {
        setTasks([]);

        setError(
          "Unable to load tasks.",
        );
      } finally {
        setLoading(false);
      }
    }, [supabase]);

  // =================================
  // CREATE TASK
  // =================================

  const createTask =
    useCallback(
      async (
        input: CreateTaskInput,
      ): Promise<Task | null> => {
        try {
          setCreatingTask(true);
          setError(null);

          const {
            data,
            error: createError,
          } = await supabase.rpc(
            "create_task",
            {
              p_title:
                input.title,

              p_description:
                input.description ||
                null,

              p_due_date:
                input.dueDate ||
                null,

              p_priority:
                input.priority,

              p_difficulty:
                input.difficulty,
            },
          );

          if (createError) {
            throw createError;
          }

          await loadTasks();

          return data as Task;
        } catch {
          setError(
            "Unable to create task.",
          );

          return null;
        } finally {
          setCreatingTask(
            false,
          );
        }
      },
      [
        loadTasks,
        supabase,
      ],
    );

  // =================================
  // COMPLETE TASK
  // =================================

  const completeTask =
    useCallback(
      async (
        taskId: string,
      ): Promise<TaskCompletionResult | null> => {
        try {
          setCompletingTaskId(
            taskId,
          );

          setError(null);

          const {
            data,
            error:
              completionError,
          } = await supabase.rpc(
            "complete_task",
            {
              p_task_id:
                taskId,
            },
          );

          if (completionError) {
            throw completionError;
          }

          const result =
            data as TaskCompletionResult;

          setTasks(
            (currentTasks) =>
              currentTasks.map(
                (task) =>
                  task.id === taskId
                    ? {
                        ...task,

                        is_completed:
                          true,

                        completed_at:
                          new Date()
                            .toISOString(),
                      }
                    : task,
              ),
          );

          return result;
        } catch {
          setError(
            "Unable to complete task.",
          );

          return null;
        } finally {
          setCompletingTaskId(
            null,
          );
        }
      },
      [supabase],
    );

  // =================================
  // UNCOMPLETE TASK
  // =================================

  const uncompleteTask =
    useCallback(
      async (
        taskId: string,
      ): Promise<TaskUncompletionResult | null> => {
        try {
          setUncompletingTaskId(
            taskId,
          );

          setError(null);

          const {
            data,
            error:
              uncompleteError,
          } = await supabase.rpc(
            "uncomplete_task",
            {
              p_task_id:
                taskId,
            },
          );

          if (uncompleteError) {
            throw uncompleteError;
          }

          const result =
            data as TaskUncompletionResult;

          setTasks(
            (currentTasks) =>
              currentTasks.map(
                (task) =>
                  task.id === taskId
                    ? {
                        ...task,

                        is_completed:
                          false,

                        completed_at:
                          null,
                      }
                    : task,
              ),
          );

          return result;
        } catch {
          setError(
            "Unable to undo task completion.",
          );

          return null;
        } finally {
          setUncompletingTaskId(
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
    void loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    creatingTask,
    completingTaskId,
    uncompletingTaskId,
    createTask,
    completeTask,
    uncompleteTask,
    refreshTasks:
      loadTasks,
  };
}