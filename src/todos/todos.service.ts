import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    private database: DatabaseService,
    private categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateTodoDto, userId: number) {
    if (dto.category_id) {
      const category = await this.categoriesService.findOne(dto.category_id);

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.user_id !== userId) {
        throw new ForbiddenException('You cannot use another user category');
      }
    }

    const result = await this.database.query(
      `
      INSERT INTO todos(
        title,
        description,
        completed,
        due_date,
        priority,
        user_id,
        category_id
      )
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        dto.title,
        dto.description ?? null,
        dto.completed ?? false,
        dto.due_date ?? null,
        dto.priority ?? 'medium',
        userId,
        dto.category_id ?? null,
      ],
    );

    return result.rows[0];
  }

  async findPublicTodos() {
    const result = await this.database.query(
      `
    SELECT
      t.id,
      t.title,
      t.description,
      t.completed,
      t.priority,
      t.due_date,
      t.created_at,
      t.updated_at,
      t.user_id,
      u.username AS username,
      c.id AS category_id,
      c.name AS category_name
    FROM todos t
    LEFT JOIN users u
      ON t.user_id = u.id
    LEFT JOIN categories c
      ON t.category_id = c.id
    ORDER BY t.created_at DESC
    LIMIT 50
    `,
    );

    return result.rows;
  }

  async findMyTodos(userId: number) {
    const result = await this.database.query(
      `
    SELECT
      t.id,
      t.title,
      t.description,
      t.completed,
      t.priority,
      t.due_date,
      t.created_at,
      c.id AS category_id,
      c.name AS category_name
    FROM todos t
    LEFT JOIN categories c
      ON t.category_id = c.id
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC
    `,
      [userId],
    );

    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.database.query(
      `
    SELECT *
    FROM todos
    WHERE id = $1
    `,
      [id],
    );

    return result.rows[0];
  }

  async checkTodoOwner(todoId: number, userId: number) {
    const todo = await this.findOne(todoId);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (todo.user_id !== userId) {
      throw new ForbiddenException('You do not have permission');
    }

    return todo;
  }

  async delete(id: number, userId: number) {
    await this.checkTodoOwner(id, userId);

    const result = await this.database.query(
      `
    DELETE FROM todos
    WHERE id = $1
    RETURNING *
    `,
      [id],
    );

    return result.rows[0];
  }

  async update(id: number, dto: UpdateTodoDto, userId: number) {
    await this.checkTodoOwner(id, userId);

    if (dto.category_id !== undefined && dto.category_id !== null) {
      const category = await this.categoriesService.findOne(dto.category_id);

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.user_id !== userId) {
        throw new ForbiddenException('You cannot use another user category');
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      values.push(dto.title);
      fields.push(`title = $${values.length}`);
    }

    if (dto.description !== undefined) {
      values.push(dto.description);
      fields.push(`description = $${values.length}`);
    }

    if (dto.completed !== undefined) {
      values.push(dto.completed);
      fields.push(`completed = $${values.length}`);
    }

    if (dto.due_date !== undefined) {
      values.push(dto.due_date);
      fields.push(`due_date = $${values.length}`);
    }

    if (dto.priority !== undefined) {
      values.push(dto.priority);
      fields.push(`priority = $${values.length}`);
    }

    if (dto.category_id !== undefined) {
      values.push(dto.category_id);
      fields.push(`category_id = $${values.length}`);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);

    const result = await this.database.query(
      `
    UPDATE todos
    SET ${fields.join(', ')}
    WHERE id = $${values.length}
    RETURNING *
    `,
      values,
    );

    return result.rows[0];
  }
}
