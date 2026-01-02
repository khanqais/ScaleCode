import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      firstName?: string
      lastName?: string
      subscriptionPlan?: string
      subscriptionStatus?: string
    } & DefaultSession["user"]
  }
  interface User {
    id: string
    email: string
    name: string
    image?: string
    firstName?: string
    lastName?: string
    subscriptionPlan?: string
    subscriptionStatus?: string
  }
}

// Extend the JWT type inline
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await connectDB()

        const user = await User.findOne({ email: credentials.email })
        
        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email.split('@')[0],
          image: user.profileImage,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionPlan: user.subscriptionPlan || 'free',
          subscriptionStatus: user.subscriptionStatus || 'active'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB()
        
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          // Create new user for OAuth sign in
          const nameParts = user.name?.split(' ') || []
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''
          
          const newUser = new User({
            email: user.email,
            firstName,
            lastName,
            profileImage: user.image,
            provider: account.provider,
            providerId: account.providerAccountId,
            subscriptionPlan: 'free',
            subscriptionStatus: 'active'
          })
          await newUser.save()
        } else if (!existingUser.provider) {
          // Update existing user with OAuth info
          existingUser.provider = account.provider
          existingUser.providerId = account.providerAccountId
          if (!existingUser.profileImage) {
            existingUser.profileImage = user.image
          }
          await existingUser.save()
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        await connectDB()
        const dbUser = await User.findOne({ email: user.email })
        
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.email = dbUser.email
          token.name = dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : dbUser.email.split('@')[0]
          token.image = dbUser.profileImage
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
          token.subscriptionPlan = dbUser.subscriptionPlan || 'free'
          token.subscriptionStatus = dbUser.subscriptionStatus || 'active'
        }
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        token.subscriptionPlan = session.subscriptionPlan || token.subscriptionPlan
        token.subscriptionStatus = session.subscriptionStatus || token.subscriptionStatus
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string | undefined
        session.user.firstName = token.firstName as string | undefined
        session.user.lastName = token.lastName as string | undefined
        session.user.subscriptionPlan = token.subscriptionPlan as string | undefined
        session.user.subscriptionStatus = token.subscriptionStatus as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
