import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import ThemeSubscriber from "./components/ThemeSubscriber";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TerraGuard - Satellite-Powered Environmental Intelligence",
  description: "Analyze environmental conditions anywhere on Earth using satellite data.",
  icons: {
    icon: "/LOGO.jpg",
    shortcut: "/LOGO.jpg",
    apple: "/LOGO.jpg",
  },
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
      >
        <ThemeProvider>
          <Navbar />
          <ThemeSubscriber>
            <main className="min-h-screen pt-16">
              {children}
            </main>
          </ThemeSubscriber>
        </ThemeProvider>
      </body>
    </html>
  );
}