import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '@fitness/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  onModuleInit() {
    if (env.REDIS_URL) {
      try {
        this.client = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 3) {
              this.logger.warn('Redis connection failed, giving up. Caching disabled.');
              return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
          },
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          this.logger.log('Redis connected successfully.');
        });

        this.client.on('error', (err) => {
          this.isConnected = false;
          this.logger.error(`Redis error: ${err.message}`);
        });
      } catch (error) {
        this.isConnected = false;
        this.logger.warn('Failed to initialize Redis client. Caching disabled.');
      }
    } else {
      this.logger.warn('REDIS_URL not found in env. Caching is disabled.');
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const stringified = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, stringified, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, stringified);
      }
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Failed to delete cache by pattern ${pattern}`, error);
    }
  }
}
