export type GoalCategory =
  | "personal"
  | "career"
  | "health"
  | "finance"
  | "education"
  | "other";

export type GoalUnit =
  | "percent"
  | "dollars"
  | "hours"
  | "days"
  | "items";

export type GoalDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: GoalUnit;
  deadline: string | null;
  difficulty: GoalDifficulty;
  xp_reward: number;
  coin_reward: number;
  position: number;
  is_completed: boolean;
  reward_claimed: boolean;
  completed_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateGoalInput = {
  title: string;
  description: string;
  icon: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: GoalUnit;
  deadline: string;
  difficulty: GoalDifficulty;
};

export type GoalProgressResult = {
  updated: boolean;
  goalId: string;
  currentValue: number;
  targetValue: number;
  progress: number;
  completed: boolean;
  rewardAwarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  level: number;
  xp: number;
  coins: number;
};