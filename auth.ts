import NextAuth from "next-auth"
import Facebook from "next-auth/providers/facebook"
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
    Facebook,
  ],
  callbacks: {
    session({ session, user }) {
      Object.assign(session.user, { id: user.id });
      return session;
    },
  },
})
