import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// AppLayout não é mais importado aqui diretamente, será usado pelas páginas que precisam dele.
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RealWise - Seu Organizador Financeiro",
  description: "Acompanhe suas receitas, despesas e alcance seus objetivos financeiros com o RealWise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthProvider>
          {children} {/* As páginas filhas (ou AppLayout) decidirão sua própria estrutura */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
