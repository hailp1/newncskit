import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NCSKIT - Research Management Platform",
  description: "Nền tảng quản lý nghiên cứu học thuật toàn diện với AI",
  keywords: "research, academic, publication, AI, Vietnam, nghiên cứu, học thuật",
  authors: [{ name: "NCSKIT Team" }],
  creator: "NCSKIT",
  publisher: "NCSKIT",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://ncskit.org",
    title: "NCSKIT - Research Management Platform",
    description: "Nền tảng quản lý nghiên cứu học thuật toàn diện với AI",
    siteName: "NCSKIT",
  },
  twitter: {
    card: "summary_large_image",
    title: "NCSKIT - Research Management Platform",
    description: "Nền tảng quản lý nghiên cứu học thuật toàn diện với AI",
    creator: "@ncskit",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
