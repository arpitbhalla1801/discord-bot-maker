import { betterAuth } from "better-auth"
import Database from "better-sqlite3"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: new Database("./data/auth.db"),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scopes: ["identify", "email"],
    },
  },
})
