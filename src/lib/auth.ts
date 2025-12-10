import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import prisma from "./db"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: ["identify", "email", "guilds"],
    },
  },
  session: {
    // Session expires after 7 days of inactivity (industry standard)
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Update session activity every 24 hours to keep it fresh
    updateAge: 60 * 60 * 24, // 24 hours in seconds
    // Cookie settings for security
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  advanced: {
    // Use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === "production",
    // Cross-site support for better compatibility
    crossSubDomainCookies: {
      enabled: false,
    },
  },
})
