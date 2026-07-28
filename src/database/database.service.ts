import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const dbUrl = this.configService.getOrThrow<string>('DATABASE_URL');

    console.log('DATABASE_URL =', dbUrl);

    this.pool = new Pool({
      connectionString: dbUrl,
    });
  }

  async query<T extends QueryResultRow>(
    text: string,
    params: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, [...params]);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
