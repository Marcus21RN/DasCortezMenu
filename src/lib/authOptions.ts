import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        return { id: user._id.toString(), email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 día
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};