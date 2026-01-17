import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect.ts";
import User from "@/models/user.ts";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Conectar a BD
        await dbConnect();

        // 2. Buscar usuario
        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password"); // Forzamos traer el password para comparar

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        // 3. Verificar contraseña
        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        // 4. Si todo bien, retornamos el objeto usuario (sin password)
        return { id: user._id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
