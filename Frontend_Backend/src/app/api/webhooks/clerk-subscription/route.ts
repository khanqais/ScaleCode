import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.SUBSCRIPTION_WEBHOOK_SECRET;
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
        userId?: string;
        email?: string;
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
      const userId = data.userId;
      const email = data.email;
      const { status } = data;
      
      if (!userId && !email) {
        return NextResponse.json({ error: 'No userId or email in webhook' }, { status: 400 });
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

      await connectDB();
      
      const query = userId ? { _id: userId } : { email: email };
      await User.findOneAndUpdate(
        query,
        {
          subscriptionPlan,
          subscriptionStatus: status,
        },
        { new: true }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: `User updated to ${subscriptionPlan}` 
      });
    }

    if (eventType === 'subscription.deleted' || eventType === 'subscription.canceled') {
      const { data } = evt;
      const userId = data.userId;
      const email = data.email;

      if (!userId && !email) {
        return NextResponse.json({ error: 'No userId or email in webhook' }, { status: 400 });
      }

      await connectDB();
      
      const query = userId ? { _id: userId } : { email: email };
      await User.findOneAndUpdate(
        query,
        {
          subscriptionPlan: 'free',
          subscriptionStatus: 'canceled',
        },
        { new: true }
      );
      
      return NextResponse.json({ 
        success: true, 
        message: `User downgraded to free` 
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