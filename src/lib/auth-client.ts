import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  // Fetch fresh session data on window focus for better UX
  fetchOptions: {
    onError(e) {
      if (e.error.status === 401) {
        console.log("Session expired")
      }
    }
  }
})

export const { useSession, signIn, signOut } = authClient
