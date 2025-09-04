import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { TRPCProvider } from "@/trpc/client";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const interFont = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "New Tube",
  description: "Created by ema",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={interFont.className}>
          <TRPCProvider>
            <Toaster position="top-right" />
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
