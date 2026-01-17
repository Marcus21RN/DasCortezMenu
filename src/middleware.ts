import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Si el usuario no tiene sesión, NextAuth lo redirigirá automáticamente a esta página:
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Aquí definimos QUÉ rutas queremos proteger.
  // El asterisco * significa "todo lo que esté dentro de esta carpeta"
  matcher: ["/admin/:path*"],
};