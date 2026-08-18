export interface CategoryEntity {
  id: number;

  name: string;

  user_id: number;

  created_at: Date;
}
export interface Category {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at?: string | null;
}
