import { z } from 'zod'

const envSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
})

// Validate environment variables at startup
export function validateEnv() {
  try {
    const parsed = envSchema.safeParse(process.env)
    
    if (!parsed.success) {
      console.error(' Invalid environment variables:', parsed.error.flatten().fieldErrors)
      throw new Error('Invalid environment variables')
    }
    
    return parsed.data
  } catch (error) {
    console.error('Failed to validate environment variables:', error)
    process.exit(1)
  }
}

// Export validated environment variables
export const env = envSchema.parse(process.env)
