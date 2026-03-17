import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import AnimatedMenu from "../app/components/AnimatedMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HelpDesk - AI Support",
  description: "Registre e analise erros do sistema",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <AnimatedMenu />
        </AuthProvider>
      </body>
    </html>
  );
}