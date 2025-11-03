import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthToggle } from "@/components/dev/auth-toggle";
import { ApiTest } from "@/components/dev/api-test";
import { AuthStatus } from "@/components/dev/auth-status";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NCSKIT - Research Management Platform",
  description: "Streamline your academic research publication process with AI-powered tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <AuthToggle />
        <ApiTest />
        <AuthStatus />
      </body>
    </html>
  );
}
