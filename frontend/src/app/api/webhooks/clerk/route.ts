// pages/api/webhooks/clerk.ts (or app/api/webhooks/clerk/route.ts for App Router)
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
)

export default async function handler(req: Request) {
  const payload = await req.text()
  const event: WebhookEvent = JSON.parse(payload)

  switch (event.type) {
    case 'user.created':
      // Sync user to Supabase when they sign up via Clerk
      const { data, error } = await supabase
        .from('users') // Custom users table in Supabase
        .insert([
          {
            clerk_id: event.data.id,
            email: event.data.email_addresses[0].email_address,
            first_name: event.data.first_name,
            last_name: event.data.last_name,
            created_at: new Date(event.data.created_at),
          },
        ])

      if (error) {
        console.error('Error syncing user to Supabase:', error)
        return new Response('Error', { status: 500 })
      }

      console.log('User synced to Supabase:', data)
      break

    case 'user.updated':
      // Update user in Supabase when they update their profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: event.data.email_addresses[0].email_address,
          first_name: event.data.first_name,
          last_name: event.data.last_name,
        })
        .eq('clerk_id', event.data.id)

      if (updateError) {
        console.error('Error updating user in Supabase:', updateError)
      }
      break

    case 'user.deleted':
      // Delete user from Supabase when they're deleted from Clerk
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', event.data.id)

      if (deleteError) {
        console.error('Error deleting user from Supabase:', deleteError)
      }
      break
  }

  return new Response('OK', { status: 200 })
}