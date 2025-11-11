import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LazyAuthModal } from "@/components/auth/lazy-auth-modal";
import { ToastProvider } from "@/components/ui/toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NCSKIT - Research Management Platform",
  description: "Nền tảng quản lý nghiên cứu học thuật toàn diện với AI",
  keywords: "research, academic, publication, AI, Vietnam, nghiên cứu, học thuật",
  authors: [{ name: "NCSKIT Team" }],
  creator: "NCSKIT",
  publisher: "NCSKIT",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://ncskit.org",
    title: "NCSKIT - Research Management Platform",
    description: "Nền tảng quản lý nghiên cứu học thuật toàn diện với AI",
    siteName: "NCSKIT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NCSKIT - Nền tảng quản lý nghiên cứu học thuật",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NCSKIT - Research Management Platform",
    description: "Nền tảng quản lý nghiên cứu học thuật toàn diện với AI",
    creator: "@ncskit",
    images: ["/twitter-image.png"],
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
            <LazyAuthModal />
          </AuthProvider>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
