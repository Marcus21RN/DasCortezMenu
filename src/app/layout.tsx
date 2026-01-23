import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
// 1. Importamos el Toaster
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
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
      <body className={`${playfair.variable} ${lato.variable} bg-[#F4F1EA] text-[#1C1C1C]`}>
        <Toaster position="bottom-center" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}