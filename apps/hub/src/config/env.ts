import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SQLITE_PATH: z.string().default('./hub.sqlite'),
  SCHOOL_ID: z.string().default('018f679a-1111-7000-8000-000000000001'),
  HUB_DEVICE_ID: z.string().default('018f679a-hub1-7000-8000-000000000001'),
  CLOUD_SYNC_URL: z.string().default('http://localhost:4000/api/v1/sync'),
  DEVICE_TOKEN: z.string().default('hub-device-master-token-abc123'),
  DEVICE_HMAC_SECRET: z.string().default('vidya-setu-device-hmac-integrity-secret-32chars'),
  CONTENT_CACHE_DIR: z.string().default('./content_cache'),
  SYNC_INTERVAL_MS: z.coerce.number().default(30000), // Check cloud every 30s
});

export type HubEnv = z.infer<typeof EnvSchema>;

export const env: HubEnv = EnvSchema.parse(process.env);
