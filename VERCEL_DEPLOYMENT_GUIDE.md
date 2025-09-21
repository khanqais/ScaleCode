# Vercel Deployment Guide for ScaleCode

This guide will help you deploy your Next.js + MongoDB application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: You'll need a MongoDB connection string (MongoDB Atlas recommended)
3. **Clerk Authentication**: Set up authentication at [clerk.com](https://clerk.com)

## Step 1: Prepare Environment Variables

1. Copy the `.env.example` file to `.env.local` in the `frontend` directory:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Fill in the required environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set the **Root Directory** to `frontend`
5. Vercel will automatically detect it's a Next.js project
6. Add environment variables in the Vercel dashboard:
   - Go to "Settings" → "Environment Variables"
   - Add all variables from your `.env.local` file

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. From the project root, deploy:
   ```bash
   vercel --cwd frontend
   ```

4. Follow the prompts and add environment variables when asked

## Step 3: Set Up MongoDB Connection

### MongoDB Atlas (Recommended)

1. Create a free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (or use `0.0.0.0/0` for all IPs)
5. Get your connection string and add it as `MONGO_URI`

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/scalecode?retryWrites=true&w=majority
```

## Step 4: Configure Clerk Authentication

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your keys from the dashboard:
   - Publishable Key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret Key → `CLERK_SECRET_KEY`

## Step 5: Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```
MONGO_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/private
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/private
NODE_ENV=production
```

## Architecture Changes Made

### Backend Migration
- Converted Express.js routes to Next.js API routes
- Moved from `/Backend` to `/frontend/src/app/api`
- Replaced Express middleware with Next.js middleware
- Updated authentication to use Clerk's server-side auth

### API Endpoints
All backend functionality is now available as Next.js API routes:

- `POST /api/problems` - Create a new problem
- `GET /api/problems` - Get user's problems (with pagination/filtering)
- `GET /api/problems/[id]` - Get specific problem
- `PUT /api/problems/[id]` - Update problem
- `DELETE /api/problems/[id]` - Delete problem
- `POST /api/users/sync` - Sync user data with Clerk
- `GET /api/users/stats` - Get user statistics

### Database Models
- Converted MongoDB models from CommonJS to ES modules
- Added TypeScript types for better type safety
- Optimized for serverless environment

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Check that your connection string includes the database name
   - Verify credentials are correct

2. **Clerk Authentication Issues**
   - Ensure all Clerk environment variables are set
   - Check that your domain is added to Clerk's allowed origins
   - Verify API routes are protected properly

3. **Build Errors**
   - Check that all dependencies are installed
   - Ensure TypeScript types are correct
   - Verify environment variables are set

### Logs and Debugging
- Check Vercel function logs in the Vercel dashboard
- Use `console.log` statements in API routes for debugging
- Monitor MongoDB Atlas logs for database connection issues

## Performance Optimization

### Serverless Considerations
- Database connections are cached to reduce cold starts
- Functions timeout after 10 seconds (configurable in `vercel.json`)
- Consider upgrading to Vercel Pro for longer execution times if needed

### Database Optimization
- Indexes are added to frequently queried fields
- Use pagination for large datasets
- Consider implementing database connection pooling for high traffic

## Maintenance

### Regular Tasks
1. Monitor Vercel function usage and costs
2. Keep dependencies updated
3. Monitor MongoDB usage and performance
4. Review and rotate API keys regularly

### Scaling Considerations
- Vercel automatically scales functions based on traffic
- MongoDB Atlas can be scaled up as needed
- Consider implementing caching for frequently accessed data

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review Next.js API routes documentation
3. Check Clerk documentation for authentication issues
4. MongoDB Atlas support for database issues

Your application is now ready for production deployment on Vercel!