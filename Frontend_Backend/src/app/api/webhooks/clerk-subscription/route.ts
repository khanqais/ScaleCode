import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { Webhook } from 'svix';

// This webhook handles Clerk subscription events
export async function POST(req: NextRequest) {
  const client = await clerkClient();
  try {
    // Get the webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get headers for verification
    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');

    // Get the body
    const body = await req.text();

    // Verify webhook signature (Clerk uses Svix for signing)
    let evt: any;
    
    if (svix_id && svix_timestamp && svix_signature) {
      // Verify with Svix if headers are present
      try {
        const wh = new Webhook(webhookSecret);
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        });
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Parse body directly if no Svix headers (for testing)
      console.warn('No Svix headers found - parsing body directly (only for testing!)');
      evt = JSON.parse(body);
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log('Received webhook event:', eventType);
    console.log('Event data:', JSON.stringify(evt.data, null, 2));

    // Handle subscription events
    if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
      const data = evt.data;
      const user_id = data.payer?.user_id;
      const status = data.status;
      
      if (!user_id) {
        console.error('No user_id found in webhook data');
        return NextResponse.json({ error: 'No user_id in webhook' }, { status: 400 });
      }

      console.log(`Processing subscription: user_id=${user_id}, status=${status}`);

      // Find the active subscription item
      const activeItem = data.items?.find((item: { status: string }) => item.status === 'active');
      const planSlug = activeItem?.plan?.slug || 'free';
      
      console.log(`Active plan slug: ${planSlug}`);

      // Map plan slug to our plan names
      let subscriptionPlan = 'free';
      if (planSlug.includes('pro_max') || planSlug.includes('promax')) {
        subscriptionPlan = 'pro_max';
      } else if (planSlug.includes('pro')) {
        subscriptionPlan = 'pro';
      }

      // Update user metadata
      await client.users.updateUser(user_id, {
        publicMetadata: {
          subscriptionPlan,
          subscriptionStatus: status,
        },
      });

      console.log(`✅ Updated user ${user_id}: plan=${subscriptionPlan}, status=${status}`);
      
      return NextResponse.json({ 
        success: true, 
        message: `User ${user_id} updated to ${subscriptionPlan}` 
      });
    }

    // Handle subscription cancellation
    if (eventType === 'subscription.deleted' || eventType === 'subscription.canceled') {
      const data = evt.data;
      const user_id = data.payer?.user_id;

      if (!user_id) {
        console.error('No user_id found in cancellation webhook');
        return NextResponse.json({ error: 'No user_id in webhook' }, { status: 400 });
      }

      await client.users.updateUser(user_id, {
        publicMetadata: {
          subscriptionPlan: 'free',
          subscriptionStatus: 'canceled',
        },
      });

      console.log(`✅ Canceled subscription for user ${user_id}`);
      
      return NextResponse.json({ 
        success: true, 
        message: `User ${user_id} downgraded to free` 
      });
    }

    return NextResponse.json({ success: true, message: 'Event received but not processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
