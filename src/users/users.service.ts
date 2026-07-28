import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { UserEntity } from 'src/common/entities/user.entity';
type CreatedUser = {
  id: number;
  username: string;
  email: string;
  created_at: Date | string;
};

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async findAll() {
    const result = await this.database.query<UserEntity>(
      `
SELECT *
FROM users
`,
    );

    return result.rows;
  }

  async create(
    username: string,
    email: string,
    password: string,
  ): Promise<CreatedUser> {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await this.database.query(
      `
    INSERT INTO users(username, email, password)
    VALUES($1, $2, $3)
    RETURNING id, username, email, created_at
    `,
      [username, email, hashedPassword],
    );

    return result.rows[0] as CreatedUser;
  }

  async findOne(id: number) {
    const result = await this.database.query(
      `
    SELECT *
    FROM users
    WHERE id = $1
    `,
      [id],
    );

    return result.rows[0];
  }

  async delete(id: number) {
    const result = await this.database.query(
      `
    DELETE FROM users
    WHERE id = $1
    RETURNING *
    `,
      [id],
    );

    return result.rows[0];
  }

  async update(id: number, username: string, email: string) {
    const result = await this.database.query(
      `
    UPDATE users
    SET username = $1,
        email = $2
    WHERE id = $3
    RETURNING *
    `,
      [username, email, id],
    );

    return result.rows[0];
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const result = await this.database.query<UserEntity>(
      `
SELECT *
FROM users
WHERE email=$1
`,
      [email],
    );

    return result.rows[0];
  }
}
