import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import { authConfig } from "@/auth.config"

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Email and OTP are required")
        }

        await connectDB()

        const user = await User.findOne({ 
          email: credentials.email.toLowerCase(),
          otp: credentials.otp,
          otpExpiry: { $gt: new Date() }
        })
        
        if (!user) {
          throw new Error("Invalid or expired OTP")
        }

        user.otp = undefined
        user.otpExpiry = undefined
        await user.save()

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`.trim() 
            : user.firstName || user.email.split('@')[0],
          image: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=random&size=200`,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionPlan: user.subscriptionPlan || 'free',
          subscriptionStatus: user.subscriptionStatus || 'active'
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB()
        
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          const nameParts = user.name?.split(' ') || []
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''
          
          const newUser = new User({
            email: user.email,
            firstName,
            lastName,
            profileImage: user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName || user.email?.split('@')[0] || 'User')}&background=random&size=200`,
            provider: account.provider,
            providerId: account.providerAccountId,
            subscriptionPlan: 'free',
            subscriptionStatus: 'active'
          })
          await newUser.save()
        } else if (!existingUser.provider) {
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
      if (url.startsWith("/")) return `${baseUrl}${url}`
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
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
})
