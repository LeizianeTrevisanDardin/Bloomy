export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: string;
  target_per_week: number;
  xp_reward: number;
  coin_reward: number;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  completed_today: boolean;
};

export type HabitDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type HabitFrequency =
  | "daily"
  | "weekdays"
  | "weekly";

export type CreateHabitInput = {
  title: string;
  description: string;
  icon: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  difficulty: HabitDifficulty;
};

export type HabitCompletionResult = {
  completed: boolean;
  alreadyCompleted: boolean;
  completedOn: string;
  level: number;
  xp: number;
  coins: number;
  xpAwarded: number;
  coinsAwarded: number;
};

export type HabitUncompletionResult = {
  uncompleted: boolean;
  alreadyUncompleted: boolean;
  completedOn: string;
  level: number;
  xp: number;
  coins: number;
  xpRemoved: number;
  coinsRemoved: number;
};