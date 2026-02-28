import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function readData<T>(key: string): Promise<T | null> {
  return await redis.get<T>(key);
}

export async function writeData<T>(key: string, data: T): Promise<void> {
  await redis.set(key, data);
}
