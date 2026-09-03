export type TaskPriority =
  | "low"
  | "medium"
  | "high";

export type TaskDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  xp_reward: number;
  coin_reward: number;
  position: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
};

export type TaskCompletionResult = {
  completed: boolean;
  alreadyCompleted: boolean;
  level: number;
  xp: number;
  coins: number;
  xpAwarded: number;
  coinsAwarded: number;
};

export type TaskUncompletionResult = {
  uncompleted: boolean;
  alreadyUncompleted: boolean;
  level: number;
  xp: number;
  coins: number;
  xpRemoved: number;
  coinsRemoved: number;
};