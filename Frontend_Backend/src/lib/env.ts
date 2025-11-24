import { z } from 'zod'

const envSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  WEBHOOK_SECRET: z.string().optional(),
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
    
    console.log(' Environment variables validated successfully')
    return parsed.data
  } catch (error) {
    console.error('Failed to validate environment variables:', error)
    process.exit(1)
  }
}

// Export validated environment variables
export const env = envSchema.parse(process.env)
