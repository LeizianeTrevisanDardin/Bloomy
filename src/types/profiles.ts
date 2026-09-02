export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  energy: number;
  created_at: string;
  updated_at: string;
};