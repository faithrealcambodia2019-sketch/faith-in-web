import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./lib/db"
import { accounts, sessions, users, verificationTokens } from "./lib/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    // Add providers here, e.g. Google
  ],
  callbacks: {
    session({ session, user }) {
      // @ts-ignore - session.user.id exists with adapter
      session.user.id = user.id;
      return session;
    },
  },
})
