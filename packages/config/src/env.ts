import { z } from 'zod';

export const envSchema = z.object({
  KAFKA_BROKER: z.string(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional()
});

export function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}