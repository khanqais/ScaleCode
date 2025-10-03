const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products and prices...\n');

    // Create Pro product
    const proProduct = await stripe.products.create({
      name: 'ScaleCode Pro',
      description: 'Create up to 200 problems per month',
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 899, // $8.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ Pro Plan Created:');
    console.log(`   Product ID: ${proProduct.id}`);
    console.log(`   Price ID: ${proPrice.id}`);
    console.log(`   Amount: $8.99/month\n`);

    // Create Pro Max product
    const proMaxProduct = await stripe.products.create({
      name: 'ScaleCode Pro Max',
      description: 'Create up to 1000 problems per month',
    });

    const proMaxPrice = await stripe.prices.create({
      product: proMaxProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log('✅ Pro Max Plan Created:');
    console.log(`   Product ID: ${proMaxProduct.id}`);
    console.log(`   Price ID: ${proMaxPrice.id}`);
    console.log(`   Amount: $19.99/month\n`);

    console.log('📝 Add these to your .env.local file:\n');
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_PRO_MAX_PRICE_ID=${proMaxPrice.id}`);

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    process.exit(1);
  }
}

setupStripeProducts();
