import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://vidyasetu:vidyasetu_secure_pass@localhost:5432/vidyasetu?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16).default('vidya-setu-super-secret-access-token-key-32chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('vidya-setu-super-secret-refresh-token-key-32chars'),
  DEVICE_HMAC_SECRET: z.string().min(16).default('vidya-setu-device-hmac-integrity-secret-32chars'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:8080'),
  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadmin_secure_key'),
  S3_BUCKET: z.string().default('vidyasetu-media'),
  S3_REGION: z.string().default('us-east-1'),
  S3_FORCE_PATH_STYLE: z.string().default('true'),
  NOTIFICATION_PROVIDER: z.enum(['mock', 'msg91', 'twilio']).default('mock'),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);
