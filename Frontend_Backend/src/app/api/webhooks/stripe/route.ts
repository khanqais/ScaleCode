import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe not configured');
      return NextResponse.json(
        { success: false, error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerkId;
        const plan = session.metadata?.plan;

        if (!clerkId || !plan) {
          console.error('Missing metadata in checkout session');
          break;
        }

        // Get subscription details
        const subscriptionResponse = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        
        const subscription = subscriptionResponse as any;

        // Update user subscription
        const problemLimit = plan === 'pro' ? 200 : 1000;
        const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date();

        await User.findOneAndUpdate(
          { clerkId },
          {
            'subscription.plan': plan,
            'subscription.stripeSubscriptionId': subscription.id,
            'subscription.stripePriceId': subscription.items.data[0].price.id as string,
            'subscription.stripeCurrentPeriodEnd': currentPeriodEnd,
            'subscription.problemLimit': problemLimit
          }
        );

        console.log(`✅ Subscription created for user ${clerkId}: ${plan}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionData = event.data.object as any;
        const customerId = subscriptionData.customer as string;

        // Find user by customer ID
        const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        // Determine plan based on price ID
        const priceId = subscriptionData.items.data[0].price.id as string;
        let plan = 'free';
        let problemLimit = 30;

        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = 'pro';
          problemLimit = 200;
        } else if (priceId === process.env.STRIPE_PRO_MAX_PRICE_ID) {
          plan = 'pro_max';
          problemLimit = 1000;
        }

        const currentPeriodEnd = subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000) : new Date();

        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': customerId },
          {
            'subscription.plan': plan,
            'subscription.stripePriceId': priceId,
            'subscription.stripeCurrentPeriodEnd': currentPeriodEnd,
            'subscription.problemLimit': problemLimit
          }
        );

        console.log(`✅ Subscription updated for customer ${customerId}: ${plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Reset user to free plan
        await User.findOneAndUpdate(
          { 'subscription.stripeCustomerId': customerId },
          {
            'subscription.plan': 'free',
            'subscription.stripeSubscriptionId': null,
            'subscription.stripePriceId': null,
            'subscription.stripeCurrentPeriodEnd': null,
            'subscription.problemLimit': 30
          }
        );

        console.log(`✅ Subscription cancelled for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoiceData = event.data.object as any;
        const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;

        if (subscriptionId) {
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionData = subscriptionResponse as any;
          const customerId = typeof subscriptionData.customer === 'string' ? subscriptionData.customer : subscriptionData.customer?.id;

          if (customerId) {
            const currentPeriodEnd = subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000) : new Date();

            // Update subscription period end
            await User.findOneAndUpdate(
              { 'subscription.stripeCustomerId': customerId },
              {
                'subscription.stripeCurrentPeriodEnd': currentPeriodEnd
              }
            );

            console.log(`✅ Payment succeeded for subscription ${subscriptionId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for invoice:', invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
