import type { Metadata } from "next";
// 1. Importamos las fuentes de Google
import { Playfair_Display, Lato } from "next/font/google"; 
import "./globals.css";

// 2. Configuramos las fuentes
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair' // Variable CSS para usar en Tailwind
});

const lato = Lato({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-lato'
});

export const metadata: Metadata = {
  title: "Das Cortez - Menú",
  description: "Menú digital de especialidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* 3. Inyectamos las variables de fuente en el body */}
      <body className={`${playfair.variable} ${lato.variable} bg-[#F4F1EA] text-[#1C1C1C]`}>
        {children}
      </body>
    </html>
  );
}