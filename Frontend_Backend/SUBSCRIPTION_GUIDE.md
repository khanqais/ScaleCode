# 📚 **Complete ScaleCode Subscription System Guide**

## 🏗️ **System Architecture Overview**

Your ScaleCode app uses:
- **Clerk** for authentication and user management
- **Stripe** for payment processing (integrated through Clerk)
- **MongoDB** for storing user problems and stats
- **Webhooks** for real-time subscription updates

---

## 🔄 **Complete Subscription Flow**

### **Step 1: User Visits Pricing Page**
```
User goes to → /pricing
```

**What happens:**
1. `src/app/pricing/page.tsx` loads
2. Shows `<PricingTable />` component from Clerk
3. Displays your three plans:
   - **Free**: 100 problems
   - **Pro**: 2000 problems  
   - **Pro Max**: 4000 problems

**Code Location:** `src/app/pricing/page.tsx`
```tsx
<PricingTable />
```

### **Step 2: User Selects a Plan**
```
User clicks "Subscribe" button on Pro or Pro Max
```

**What happens:**
1. Clerk's `<PricingTable />` handles the click
2. Redirects user to **Stripe Checkout** (managed by Clerk)
3. User enters payment details on Stripe's secure page
4. Stripe processes the payment

### **Step 3: Payment Success**
```
Stripe → Clerk → Your Webhook
```

**What happens:**
1. **Stripe** confirms payment success
2. **Clerk** receives the payment confirmation
3. **Clerk** sends a webhook to your app: `/api/webhooks/clerk-subscription`

### **Step 4: Webhook Processes Subscription**
```
POST /api/webhooks/clerk-subscription
```

**Code Location:** `src/app/api/webhooks/clerk-subscription/route.ts`

**Your webhook code runs:**
```typescript
// 1. Verify webhook is from Clerk (using Svix)
const wh = new Webhook(webhookSecret);
evt = wh.verify(body, {
  'svix-id': svix_id,
  'svix-timestamp': svix_timestamp,
  'svix-signature': svix_signature,
});

// 2. Extract subscription data
const eventType = evt.type; // 'subscription.created' or 'subscription.updated'
const user_id = evt.data.payer?.user_id;
const status = evt.data.status;

// 3. Determine the plan
const activeItem = evt.data.items?.find(item => item.status === 'active');
const planSlug = activeItem?.plan?.slug;

// 4. Map plan slug to your plan names
let subscriptionPlan = 'free';
if (planSlug.includes('pro_max') || planSlug.includes('promax')) {
    subscriptionPlan = 'pro_max';
} else if (planSlug.includes('pro')) {
    subscriptionPlan = 'pro';
}

// 5. Update user in Clerk
await client.users.updateUser(user_id, {
    publicMetadata: {
        subscriptionPlan: subscriptionPlan,
        subscriptionStatus: status,
    }
});
```

### **Step 5: User Gets Updated Permissions**
```
User can now create more problems!
```

**What happens:**
1. User's Clerk profile now has updated `publicMetadata`
2. When user tries to create problems, your API checks their plan
3. New limits apply immediately

---

## 🔒 **How Authorization Works**

### **When User Creates a Problem**
```
POST /api/problems
```

**Code Location:** `src/app/api/problems/route.ts`

**Your API checks limits:**
```typescript
// 1. Get user ID from Clerk session
const { userId } = await auth();

// 2. Get user's plan from Clerk
async function getUserPlan(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const subscriptionPlan = user.publicMetadata?.subscriptionPlan as string || 'free';
  return subscriptionPlan; 
}

// 3. Check limits
function getProblemLimit(plan: string): number {
  const limits: Record<string, number> = {
    'free': 100,
    'pro': 2000,
    'pro_max': 4000
  };
  return limits[plan] || 100;
}

const userPlan = await getUserPlan(userId);
const problemLimit = getProblemLimit(userPlan);
const currentProblemCount = await Problem.countDocuments({ userId });

// 4. Block if limit reached
if (currentProblemCount >= problemLimit) {
    return NextResponse.json({
        success: false,
        error: 'Problem limit reached',
        message: `You've reached your ${userPlan} plan limit of ${problemLimit} problems.`,
        limitReached: true,
        currentPlan: userPlan,
        currentCount: currentProblemCount,
        limit: problemLimit
    }, { status: 403 });
}
```

### **Checking Current Subscription Status**
```
GET /api/subscription/status
```

**Code Location:** `src/app/api/subscription/status/route.ts`

**Returns:**
```json
{
    "success": true,
    "subscription": {
        "plan": "pro",
        "status": "active",
        "features": {
            "problemLimit": 2000,
            "features": [
                "Up to 2000 problems",
                "Advanced organization", 
                "Priority support",
                "Revision tracking",
                "Custom categories"
            ]
        }
    }
}
```

---

## 🛠️ **Development Setup**

### **1. Stripe Setup**
**Code Location:** `scripts/setupStripe.js`

Run this script to create Stripe products:
```bash
node scripts/setupStripe.js
```

**Creates:**
- **Pro Plan**: $8.99/month (2000 problems)
- **Pro Max Plan**: $19.99/month (4000 problems)
- Gives you price IDs for environment variables

**Script Output:**
```
✅ Pro Plan Created:
   Product ID: prod_xxxxx
   Price ID: price_xxxxx
   Amount: $8.99/month

✅ Pro Max Plan Created:
   Product ID: prod_xxxxx  
   Price ID: price_xxxxx
   Amount: $19.99/month

📝 Add these to your .env.local file:
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_PRO_MAX_PRICE_ID=price_xxxxx
```

### **2. Environment Variables Needed**
Create `.env.local` file:
```env
# Clerk Authentication
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxxxx
CLERK_SECRET_KEY=sk_xxxxx

# Stripe (integrated through Clerk)
STRIPE_SECRET_KEY=sk_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_PRO_MAX_PRICE_ID=price_xxxxx

# Database
MONGODB_URI=mongodb://xxxxx
```

### **3. Webhook URL Setup**

**For Development (using ngrok):**
```bash
# Start ngrok
ngrok http 3000

# Use this URL in Clerk dashboard:
https://your-ngrok-url.ngrok.io/api/webhooks/clerk-subscription
```

**For Production:**
```
https://yourdomain.com/api/webhooks/clerk-subscription
```

**Configure in Clerk Dashboard:**
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint URL
3. Select events: `subscription.created`, `subscription.updated`, `subscription.deleted`
4. Copy the webhook secret to your `.env.local`

---

## 🎯 **Key Code Files**

### **1. Pricing Page**
**File:** `src/app/pricing/page.tsx`
- Shows Clerk's `<PricingTable />`
- Users click to start subscription
- Redirects to Stripe checkout

### **2. Webhook Handler**  
**File:** `src/app/api/webhooks/clerk-subscription/route.ts`
- Receives Clerk webhooks
- Updates user subscription status
- Uses Svix for security verification
- Handles: `subscription.created`, `subscription.updated`, `subscription.deleted`

### **3. Problem Creation API**
**File:** `src/app/api/problems/route.ts`
- Checks user's current plan via `getUserPlan()`
- Enforces problem limits via `getProblemLimit()`
- Creates problems if under limit
- Returns usage information

### **4. Subscription Status API**
**File:** `src/app/api/subscription/status/route.ts`  
- Returns current user's plan
- Used by frontend to show limits
- Includes plan features

### **5. Frontend Add Problem Page**
**File:** `src/app/add-problem/page.tsx`
- Checks usage limits before allowing submission
- Shows current usage vs limit
- Displays upgrade prompt when limit reached

---

## 🔄 **Subscription Events Timeline**

```
Timeline: User Subscribes to Pro Plan

1. 🖱️  User clicks "Subscribe Pro" → Clerk Pricing Table
2. 🔄 Clerk → Stripe Checkout page opens
3. 💳 User enters payment → Stripe processes payment
4. ✅ Payment success → Stripe → Clerk notification
5. 📡 Clerk sends webhook → POST /api/webhooks/clerk-subscription
6. 🔐 Webhook verifies with Svix → Process subscription data
7. 👤 Update user metadata → clerkClient.users.updateUser()
8. 📊 User metadata updated → { subscriptionPlan: 'pro', subscriptionStatus: 'active' }
9. 🚀 User gets new permissions → Can create 2000 problems
10. 🖥️ Frontend updates → Shows new limits immediately
```

---

## 🧪 **Testing the Flow**

### **1. Test Subscription Flow**
1. Start your development server: `npm run dev`
2. Start ngrok: `ngrok http 3000`  
3. Update webhook URL in Clerk dashboard
4. Go to `/pricing` page
5. Click "Subscribe Pro" 
6. Use Stripe test cards:
   - **Success**: `4242424242424242`
   - **Decline**: `4000000000000002`
   - **3D Secure**: `4000002500003155`

### **2. Test Webhook Reception**
```bash
# Monitor webhook calls in your terminal
# Your webhook will log:
console.log('Received webhook event:', eventType);
console.log('Event data:', JSON.stringify(evt.data, null, 2));
```

### **3. Test Problem Limits**
1. Check current limit: `GET /api/subscription/status`
2. Create problems up to your limit
3. Try creating one more
4. Should get "limit reached" error:
```json
{
    "success": false,
    "error": "Problem limit reached", 
    "limitReached": true,
    "currentPlan": "free",
    "currentCount": 100,
    "limit": 100
}
```

### **4. Debug User Metadata**
**File:** `src/app/api/debug/user-metadata/route.ts`
```typescript
export async function GET() {
    const { userId } = await auth();
    const user = await currentUser();
    
    return NextResponse.json({
        userId,
        metadata: user?.publicMetadata,
        subscriptionPlan: user?.publicMetadata?.subscriptionPlan || 'free',
        subscriptionStatus: user?.publicMetadata?.subscriptionStatus || 'inactive'
    });
}
```

Access: `GET /api/debug/user-metadata`

---

## 📊 **Plan Limits & Features**

| Plan | Problems | Price | Features |
|------|----------|-------|----------|
| **Free** | 100 | $0/month | Basic organization, Revision tracking |
| **Pro** | 2000 | $8.99/month | Advanced organization, Priority support, Custom categories |
| **Pro Max** | 4000 | $19.99/month | All Pro features + Advanced analytics, Export functionality |

### **Plan Feature Details**
```typescript
// Code from: src/app/api/subscription/status/route.ts
function getPlanFeatures(plan: string) {
  const features = {
    'free': {
      problemLimit: 100,
      features: [
        'Up to 100 problems',
        'Basic organization', 
        'Revision tracking'
      ]
    },
    'pro': {
      problemLimit: 2000,
      features: [
        'Up to 2000 problems',
        'Advanced organization',
        'Priority support',
        'Revision tracking',
        'Custom categories'
      ]
    },
    'pro_max': {
      problemLimit: 4000,
      features: [
        'Up to 4000 problems',
        'Unlimited organization',
        'Priority support', 
        'Advanced analytics',
        'Revision tracking',
        'Custom categories',
        'Export functionality'
      ]
    }
  };
  return features[plan] || features['free'];
}
```

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Webhook Not Receiving Events**
**Symptoms:** User subscribes but plan doesn't update

**Solutions:**
```bash
# Check webhook secret is correct
echo $CLERK_WEBHOOK_SECRET

# Check ngrok is running and URL is correct
ngrok http 3000

# Check webhook URL in Clerk dashboard matches ngrok URL
# Webhook should be: https://your-ngrok-url.ngrok.io/api/webhooks/clerk-subscription

# Check webhook logs in Clerk dashboard for errors
```

### **Issue 2: Svix Verification Failing**
**Symptoms:** Webhook receives events but returns 400 "Invalid signature"

**Temporary Fix for Development:**
```typescript
// In your webhook file, temporarily bypass verification:
if (process.env.NODE_ENV === 'development') {
    console.warn('Development mode - skipping Svix verification');
    evt = JSON.parse(body);
} else {
    // Use Svix verification in production
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(body, headers);
}
```

### **Issue 3: User Still Shows Free Plan After Payment**
**Debug Steps:**
1. Check webhook was received:
```bash
# Look for logs like:
# "Received webhook event: subscription.created"
# "Updated user user_xxxxx: plan=pro, status=active"
```

2. Check user metadata directly:
```typescript
// Add to your debug route:
const user = await currentUser();
console.log('User metadata:', user?.publicMetadata);
```

3. Manually update user for testing:
```typescript
// Use debug route: POST /api/debug/update-plan
{
    "plan": "pro"
}
```

### **Issue 4: Problem Limits Not Working**
**Check these functions:**
```typescript
// 1. getUserPlan() is reading metadata correctly
// 2. getProblemLimit() returns correct limits  
// 3. Problem.countDocuments({ userId }) counts correctly
```

---

## 🔧 **Maintenance & Monitoring**

### **1. Monitor Subscription Health**
```typescript
// Add to your monitoring dashboard
export async function GET() {
    const totalUsers = await User.countDocuments();
    const freeUsers = await clerkClient.users.getUserList({
        query: 'publicMetadata.subscriptionPlan:free'
    });
    const proUsers = await clerkClient.users.getUserList({
        query: 'publicMetadata.subscriptionPlan:pro'
    });
    
    return NextResponse.json({
        totalUsers,
        freeUsers: freeUsers.length,
        proUsers: proUsers.length
    });
}
```

### **2. Handle Failed Payments**
Your webhook already handles:
- `subscription.deleted` → Downgrades to free
- `subscription.canceled` → Downgrades to free

### **3. Upgrade/Downgrade Flow**
Users can change plans through Clerk's customer portal:
- Clerk handles the Stripe customer portal
- Sends webhooks for plan changes
- Your webhook updates the user automatically

---

## 🚀 **Deployment Checklist**

### **Before Going Live:**
- [ ] Environment variables set in production
- [ ] Webhook URL updated to production domain
- [ ] Stripe keys switched from test to live
- [ ] Clerk configured for production
- [ ] Database connected
- [ ] SSL certificate installed
- [ ] Test complete subscription flow

### **Production Webhook URL:**
```
https://yourdomain.com/api/webhooks/clerk-subscription
```

---

## 📝 **Additional Notes**

### **Why Svix?**
- Clerk uses Svix internally for webhook signing
- Provides security to verify webhooks are actually from Clerk
- Required for production, can be bypassed in development

### **Why Clerk + Stripe?**
- Clerk handles all the payment UI and customer management
- You don't need to build subscription management UI
- Automatic webhook handling for subscription changes
- Built-in customer portal for users to manage subscriptions

### **Data Flow:**
```
User Action → Clerk UI → Stripe Payment → Clerk Webhook → Your API → Database Update
```

This guide covers your entire subscription system end-to-end! 🎉