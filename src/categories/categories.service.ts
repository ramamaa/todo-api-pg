import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Category } from 'src/common/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private database: DatabaseService) {}

  async create(name: string, userId: number) {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const existing = await this.database.query(
      `
    SELECT *
    FROM categories
    WHERE user_id = $1
      AND LOWER(TRIM(name)) = LOWER($2)
    `,
      [userId, normalizedName],
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await this.database.query(
      `
    INSERT INTO categories(name, user_id)
    VALUES($1, $2)
    RETURNING *
    `,
      [normalizedName, userId],
    );

    return result.rows[0];
  }

  async findAll() {
    const result = await this.database.query(
      `
      SELECT *
      FROM categories
      ORDER BY id
      `,
    );

    return result.rows;
  }

  async findMyCategories(userId: number) {
    const result = await this.database.query(
      `
      SELECT *
      FROM categories
      WHERE user_id = $1
      ORDER BY id
      `,
      [userId],
    );

    return result.rows;
  }

  async findOne(id: number): Promise<Category | undefined> {
    const result = await this.database.query<Category>(
      `
    SELECT *
    FROM categories
    WHERE id = $1
    `,
      [id],
    );

    return result.rows[0];
  }

  async findOrCreate(name: string, userId: number): Promise<Category> {
    const normalizedName = name.trim().replace(/\s+/g, ' ').toLowerCase();

    const existing = await this.database.query<Category>(
      `
    SELECT *
    FROM categories
    WHERE user_id = $1
      AND LOWER(TRIM(name)) = $2
    LIMIT 1
    `,
      [userId, normalizedName],
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await this.database.query<Category>(
      `
    INSERT INTO categories(name, user_id)
    VALUES($1, $2)
    RETURNING *
    `,
      [name.trim().replace(/\s+/g, ' '), userId],
    );

    return result.rows[0];
  }
}
