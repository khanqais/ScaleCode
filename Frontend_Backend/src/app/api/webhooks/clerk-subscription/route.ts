import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { Webhook } from 'svix';

export async function POST(req: NextRequest) {
  const client = await clerkClient();
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');
    const body = await req.text();

    
    let evt: {
      type: string;
      data: {
        payer?: { user_id: string };
        status: string;
        items?: Array<{
          status: string;
          plan?: { slug: string };
        }>;
      };
    };
    
    if (svix_id && svix_timestamp && svix_signature) {
      try {
        const wh = new Webhook(webhookSecret);
        evt = wh.verify(body, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        }) as typeof evt;
      } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      evt = JSON.parse(body);
    }

    const eventType = evt.type;

    if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
      const { data } = evt;
      const { user_id } = data.payer || {};
      const { status } = data;
      
      if (!user_id) {
        return NextResponse.json({ error: 'No user_id in webhook' }, { status: 400 });
      }

      const activeItem = data.items?.find((item: { status: string }) => 
        item.status === 'active' || item.status === 'upcoming'
      ) || data.items?.find((item: { status: string }) => 
        item.status !== 'ended' && item.status !== 'canceled' && item.status !== 'abandoned'
      ) || data.items?.[0];
      
      const planSlug = activeItem?.plan?.slug || 'free';
      const normalizedSlug = String(planSlug).toLowerCase().trim();

      let subscriptionPlan = 'free';
      
      if (normalizedSlug === 'advanced' || normalizedSlug.includes('advanced')) {
        subscriptionPlan = 'pro_max';
      } else if (normalizedSlug === 'pro_max' || normalizedSlug.includes('pro_max')) {
        subscriptionPlan = 'pro_max';
      } else if (normalizedSlug === 'pro' || (normalizedSlug.includes('pro') && !normalizedSlug.includes('max') && !normalizedSlug.includes('advanced'))) {
        subscriptionPlan = 'pro';
      } else if (normalizedSlug === 'free') {
        subscriptionPlan = 'free';
      }

      await client.users.updateUser(user_id, {
        publicMetadata: {
          subscriptionPlan,
          subscriptionStatus: status,
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: `User ${user_id} updated to ${subscriptionPlan}` 
      });
    }

    if (eventType === 'subscription.deleted' || eventType === 'subscription.canceled') {
      const { data } = evt;
      const { user_id } = data.payer || {};

      if (!user_id) {
        return NextResponse.json({ error: 'No user_id in webhook' }, { status: 400 });
      }

      await client.users.updateUser(user_id, {
        publicMetadata: {
          subscriptionPlan: 'free',
          subscriptionStatus: 'canceled',
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: `User ${user_id} downgraded to free` 
      });
    }

    return NextResponse.json({ success: true, message: 'Event received but not processed' });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}