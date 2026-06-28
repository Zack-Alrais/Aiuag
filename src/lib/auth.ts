import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { findUserByEmail, verifyStoredPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await findUserByEmail(credentials.email as string);

        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        // If user was created via Google, suggest Google login
        if (user.password === "google_auth") {
          throw new Error("google-auth-required");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("email-not-verified");
        }

        const passwordCheck = await verifyStoredPassword(
          credentials.password as string,
          user.password
        );

        if (!passwordCheck.isValid) {
          return null;
        }

        if (passwordCheck.isPlainText) {
          const hashedPassword = await bcrypt.hash(credentials.password as string, 12);
          await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        (session.user as any).id = token.id;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split("@")[0],
                password: "google_auth",
                image: user.image,
                emailVerified: new Date(),
                role: "member",
              },
            });
            // Create Member record for Google users
            await prisma.member.create({
              data: { userId: newUser.id, status: "active" },
            }).catch(e => console.error("Failed to create Member for Google user:", e));
            user.id = newUser.id;
            (user as any).role = newUser.role;
          } else {
            // Update existing user's image from Google if not set or if it's a Google URL
            if (user.image && existingUser.image !== user.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: user.image },
              });
            }
            // Ensure Member record exists for existing users
            const existingMember = await prisma.member.findUnique({ where: { userId: existingUser.id } });
            if (!existingMember) {
              await prisma.member.create({
                data: { userId: existingUser.id, status: "active" },
              }).catch(e => console.error("Failed to create Member for existing Google user:", e));
            }
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
          }
        } catch (e) {
          console.error("Google sign-in error:", e);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});
