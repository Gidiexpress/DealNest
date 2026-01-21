import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dealnest.com'),
  title: {
    default: "DealNest - Secure Deals & Escrow Payments",
    template: "%s | DealNest"
  },
  description: "Secure, reliable platform for deals, freelancer transactions, and escrow payments with peace of mind.",
  keywords: ["escrow", "secure payments", "freelance platform", "business deals", "secure transactions"],
  authors: [{ name: "DealNest Team" }],
  creator: "DealNest",
  publisher: "DealNest",
  icons: {
    icon: "/favicon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dealnest.com",
    siteName: "DealNest",
    title: "DealNest - Secure Deals & Escrow Payments",
    description: "The professional standard for securing your high-value transactions and freelance contracts.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DealNest Security"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DealNest - Secure Deals",
    description: "Stop worrying about payment disputes. Secure your deals with DealNest.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
