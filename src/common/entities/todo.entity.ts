export interface TodoEntity {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  due_date: Date | null;
  user_id: number;
  category_id: number | null;
  created_at: Date;
  updated_at: Date;
}
export interface TodoWithCategory {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
  category: string | null;
}
