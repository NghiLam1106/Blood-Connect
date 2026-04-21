// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../../../generated/prisma/client';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
      connectionString: process.env.DATABASE_URL,
      max: 5,
    }
    : {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT),
      max: 5,
    }
);

const adapter = new PrismaPg(pool);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      adapter,
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
