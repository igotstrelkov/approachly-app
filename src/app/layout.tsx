import type { Metadata, Viewport } from "next";
import { Anton, Inter, Space_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { PwaRegister } from "./PwaRegister";
import MetaPixel from "./MetaPixel";
import Plausible from "./Plausible";
import "./globals.css";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Couragely — Beat the freeze",
  description:
    "Gamify approaching people IRL. Reward the courage, never the outcome — and watch your approach anxiety fall.",
  applicationName: "Couragely",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Couragely",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Clerk requires a publishable key to render its provider. During Phase-1 design
// work (before keys are set) we boot without it so the ported UI is previewable.
const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const tree = (
    <html
      lang="en"
      className={`${display.variable} ${inter.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <PwaRegister />
        <MetaPixel />
        <Plausible />
      </body>
    </html>
  );
  return hasClerk ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
